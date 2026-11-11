#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Motor de avaliacao de RedFlags do SICX.

Objetivo:
    Ler eventos em JSONL, aplicar as regras de redflags/redflags.yaml e
    gerar alertas em JSON (append-only) com severidade, timestamp, regra
    disparada, acao recomendada e playbook.

Risco:
    Nenhum. Este script apenas avalia e registra. Nao executa nenhuma
    acao destrutiva nem altera disponibilidade de sistemas.

Prerequisitos:
    - Python 3.10+
    - PyYAML (pip install pyyaml)
    - Arquivo de hash do token de operador provisionado pela equipe interna
      (padrao: redflag/.acesso/operador.sha256). Sem ele, o motor recusa
      a execucao. Usuarios externos nao conseguem utilizar a ferramenta.

Uso:
    export REDFLAG_OPERATOR_TOKEN="<TOKEN_OPERADOR_INTERNO>"
    python3 scripts/avaliar_redflags.py redflags/exemplos-eventos.jsonl

    Opcoes:
        --regras CAMINHO      Arquivo de regras YAML (padrao: redflags/redflags.yaml)
        --saida CAMINHO       Arquivo de alertas append-only (padrao: alerts.jsonl)
        --token-hash CAMINHO  Arquivo com SHA-256 hex do token (padrao: .acesso/operador.sha256)
        --token TOKEN         Token do operador (ou variavel REDFLAG_OPERATOR_TOKEN)

Codigo de saida:
    0 - nenhuma RedFlag critica
    1 - erro de uso, acesso negado ou arquivo invalido
    2 - ao menos uma RedFlag critica disparada
"""

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import yaml
except ImportError:
    print("ERRO: PyYAML nao instalado. Execute: pip install pyyaml", file=sys.stderr)
    sys.exit(1)

RAIZ = Path(__file__).resolve().parent.parent

CAMPOS_OBRIGATORIOS_REGRA = [
    "id", "nome", "categoria", "severidade", "fonte", "condicao",
    "janela", "acao_imediata", "playbook", "responsavel", "sla",
    "evidencia_necessaria", "requer_aprovacao_humana",
]

SEVERIDADES = ("critica", "alta", "media", "baixa")


class AcessoNegado(Exception):
    pass


def carregar_regras(caminho_regras: Path) -> list:
    if not caminho_regras.exists():
        raise FileNotFoundError(f"Arquivo de regras nao encontrado: {caminho_regras}")
    dados = yaml.safe_load(caminho_regras.read_text(encoding="utf-8"))
    regras = dados.get("regras") if isinstance(dados, dict) else None
    if not isinstance(regras, list) or not regras:
        raise ValueError("Nenhuma regra encontrada no arquivo de regras")
    for regra in regras:
        faltando = [c for c in CAMPOS_OBRIGATORIOS_REGRA if c not in regra]
        if faltando:
            raise ValueError(f"Regra {regra.get('id', '?')} sem campos: {', '.join(faltando)}")
        if regra["severidade"] not in SEVERIDADES:
            raise ValueError(f"Regra {regra['id']} com severidade invalida: {regra['severidade']}")
    return regras


def carregar_eventos(caminho_eventos: Path) -> list:
    if not caminho_eventos.exists():
        raise FileNotFoundError(f"Arquivo de eventos nao encontrado: {caminho_eventos}")
    eventos = []
    for numero, linha in enumerate(caminho_eventos.read_text(encoding="utf-8").splitlines(), start=1):
        linha = linha.strip()
        if not linha:
            continue
        try:
            evento = json.loads(linha)
        except json.JSONDecodeError as erro:
            raise ValueError(f"Linha {numero} invalida em {caminho_eventos}: {erro}")
        if not isinstance(evento, dict):
            raise ValueError(f"Linha {numero} em {caminho_eventos} nao e um objeto JSON")
        eventos.append(evento)
    return eventos


def evento_corresponde(evento: dict, condicao: dict) -> bool:
    for campo, esperado in condicao.items():
        valor = evento.get(campo)
        if isinstance(esperado, list):
            if valor not in esperado:
                return False
        elif valor != esperado:
            return False
    return True


def avaliar(eventos: list, regras: list) -> list:
    alertas = []
    agora = datetime.now(timezone.utc).isoformat()
    for evento in eventos:
        for regra in regras:
            if evento_corresponde(evento, regra["condicao"]):
                alertas.append({
                    "timestamp": agora,
                    "severidade": regra["severidade"],
                    "redflag": regra["id"],
                    "nome": regra["nome"],
                    "categoria": regra["categoria"],
                    "acao_recomendada": regra["acao_imediata"],
                    "playbook": regra["playbook"],
                    "responsavel": regra["responsavel"],
                    "sla": regra["sla"],
                    "requer_aprovacao_humana": regra["requer_aprovacao_humana"],
                    "evidencia_necessaria": regra["evidencia_necessaria"],
                    "evento_origem": evento,
                })
    return alertas


def registrar_alertas(alertas: list, caminho_saida: Path) -> None:
    caminho_saida.parent.mkdir(parents=True, exist_ok=True)
    with caminho_saida.open("a", encoding="utf-8") as arquivo:
        for alerta in alertas:
            arquivo.write(json.dumps(alerta, ensure_ascii=False) + "\n")


def registrar_execucao(linha: str, caminho_log: Path) -> None:
    caminho_log.parent.mkdir(parents=True, exist_ok=True)
    with caminho_log.open("a", encoding="utf-8") as arquivo:
        arquivo.write(linha + "\n")


def verificar_token(token: str | None, caminho_hash: Path) -> None:
    if not token:
        raise AcessoNegado(
            "Token de operador ausente. Defina REDFLAG_OPERATOR_TOKEN ou use --token. "
            "Uso restrito a operadores internos."
        )
    if not caminho_hash.exists():
        raise AcessoNegado(
            f"Arquivo de hash do token nao provisionado: {caminho_hash}. "
            "A equipe interna deve cria-lo com o SHA-256 do token do operador."
        )
    esperado = caminho_hash.read_text(encoding="utf-8").strip().lower()
    informado = hashlib.sha256(token.encode("utf-8")).hexdigest()
    if informado != esperado:
        raise AcessoNegado("Token de operador invalido. Acesso negado.")


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Motor de avaliacao de RedFlags do SICX")
    parser.add_argument("eventos", help="Arquivo de eventos em JSONL")
    parser.add_argument("--regras", default=str(RAIZ / "redflags" / "redflags.yaml"))
    parser.add_argument("--saida", default=str(RAIZ / "alerts.jsonl"))
    parser.add_argument("--token-hash", default=str(RAIZ / ".acesso" / "operador.sha256"))
    parser.add_argument("--log-execucao", default=str(RAIZ / "logs" / "execucoes.log"))
    parser.add_argument("--token", default=os.environ.get("REDFLAG_OPERATOR_TOKEN"))
    args = parser.parse_args(argv)

    try:
        verificar_token(args.token, Path(args.token_hash))
    except AcessoNegado as erro:
        print(f"ACESSO NEGADO: {erro}", file=sys.stderr)
        return 1

    try:
        regras = carregar_regras(Path(args.regras))
        eventos = carregar_eventos(Path(args.eventos))
    except (FileNotFoundError, ValueError) as erro:
        print(f"ERRO: {erro}", file=sys.stderr)
        return 1

    alertas = avaliar(eventos, regras)
    registrar_alertas(alertas, Path(args.saida))
    criticos = [a for a in alertas if a["severidade"] == "critica"]
    registrar_execucao(
        json.dumps({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "acao": "avaliacao_redflags",
            "eventos": len(eventos),
            "alertas": len(alertas),
            "criticos": len(criticos),
        }, ensure_ascii=False),
        Path(args.log_execucao),
    )

    print(json.dumps({"alertas": len(alertas), "criticos": len(criticos),
                      "registro": str(args.saida)}, ensure_ascii=False))
    for alerta in alertas:
        print(json.dumps(alerta, ensure_ascii=False))

    return 2 if criticos else 0


if __name__ == "__main__":
    sys.exit(main())
