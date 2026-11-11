#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Backend de IA - varredura de portas e identificacao de invasor em tempo real.

Objetivo:
    Operacao de seguranca sempre ativa: monitora TODAS as portas locais
    (incluindo a porta afetada no incidente de santow, configuravel),
    aprende a linha de base de trafego e, em qualquer caso de
    anormalidade, pontua o comportamento com modelo de IA estatistica
    (novidade de origem, taxa de conexoes, varredura de portas, porta
    fora do padrao) e identifica o invasor suspeito com evidencias.

Risco:
    Baixo. Somente leitura e registro. Nao bloqueia, nao encerra
    processos e nao altera disponibilidade. Acoes de contencao ficam nos
    playbooks e exigem aprovacao humana.

Prerequisitos:
    - Python 3.10+ com PyYAML.
    - Token de operador provisionado (redflag/.acesso/operador.sha256).
      Usuarios externos nao conseguem executar.
    - Em modo sistema, ferramenta `ss` (iproute2) para leitura de conexoes.

Modos:
    Tempo real (sempre ativo, loop continuo):
        export REDFLAG_OPERATOR_TOKEN="<TOKEN_OPERADOR_INTERNO>"
        python3 backend.py

    Ciclo unico (diagnostico):
        python3 backend.py --uma-vez

    Replay de evidencias (analise offline, mesmo motor de IA):
        python3 backend.py --entrada ciclos.jsonl --uma-vez

    Integracao com o motor RedFlag (gera alertas e aciona RF-IA-01):
        python3 backend.py --motor

Saidas (append-only):
    ia/invasores.jsonl  - perfil do invasor suspeito identificado
    ia/eventos_ia.jsonl - eventos normalizados para o motor RedFlag
    ia/baseline.json    - linha de base aprendida (atualizada por ciclo)

Codigo de saida:
    0 - nenhum invasor identificado no ciclo
    1 - acesso negado ou erro de entrada
    2 - invasor suspeito identificado com score alto
"""

import argparse
import importlib.util
import json
import os
import re
import statistics
import subprocess
import sys
import time
from collections import deque
from datetime import datetime, timezone
from pathlib import Path

RAIZ_IA = Path(__file__).resolve().parent
RAIZ_REDFLAG = RAIZ_IA.parent

ESPEC_MOTOR = RAIZ_REDFLAG / "scripts" / "avaliar_redflags.py"


def _carregar_motor():
    spec = importlib.util.spec_from_file_location("avaliar_redflags", ESPEC_MOTOR)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


MOTOR = _carregar_motor()
verificar_token = MOTOR.verificar_token


def agora_iso():
    return datetime.now(timezone.utc).isoformat()


def carregar_config(caminho: Path) -> dict:
    import yaml
    if not caminho.exists():
        raise FileNotFoundError(f"Configuracao nao encontrada: {caminho}")
    return yaml.safe_load(caminho.read_text(encoding="utf-8")) or {}


REGEX_SS = re.compile(r"^(?P<estado>\S+)\s+\d+\s+\d+\s+(?P<local>\S+)\s+(?P<remoto>\S+)")


def separar_ip_porta(endereco: str):
    endereco = endereco.strip()
    if endereco.startswith("["):
        ip, _, porta = endereco.rpartition("]:")
        return ip.lstrip("["), porta
    ip, _, porta = endereco.rpartition(":")
    return ip, porta


def coletar_conexoes_sistema() -> list:
    try:
        resultado = subprocess.run(["ss", "-tunH"], capture_output=True, text=True, timeout=10)
    except (FileNotFoundError, subprocess.SubprocessError):
        print("AVISO: ferramenta ss indisponivel; ciclo sem coleta do sistema.", file=sys.stderr)
        return []
    conexoes = []
    for linha in resultado.stdout.splitlines():
        m = REGEX_SS.match(linha)
        if not m:
            continue
        l_ip, l_porta = separar_ip_porta(m.group("local"))
        r_ip, r_porta = separar_ip_porta(m.group("remoto"))
        if not l_porta.isdigit() or not r_porta.isdigit():
            continue
        conexoes.append({
            "estado": m.group("estado"),
            "porta_local": int(l_porta),
            "ip_origem": r_ip,
            "porta_remota": int(r_porta),
        })
    return conexoes


def agregar_ciclo(conexoes: list) -> dict:
    por_ip = {}
    for c in conexoes:
        entrada = por_ip.setdefault(c["ip_origem"], {
            "conexoes": 0, "portas_locais": set(), "portas_remotas": set(),
        })
        entrada["conexoes"] += 1
        entrada["portas_locais"].add(c["porta_local"])
        entrada["portas_remotas"].add(c["porta_remota"])
    return por_ip


class ModeloIA:
    """Modelo de IA estatistica: aprende a linha de base e pontua anomalias."""

    def __init__(self, config: dict):
        self.min_amostras = int(config.get("min_amostras_baseline", 10))
        self.limiar = int(config.get("limiar_anomalia", 70))
        self.portas_internas = set(config.get("portas_servicos_internas", []) or [])
        self.portas_incidente = {}
        for nome, dados in (config.get("incidentes", {}) or {}).items():
            porta = dados.get("porta") if isinstance(dados, dict) else None
            if isinstance(porta, int):
                self.portas_incidente[porta] = nome
        self.historico = deque(maxlen=200)

    @property
    def pronto(self) -> bool:
        return len(self.historico) >= self.min_amostras

    def aprender(self, ciclo: dict) -> None:
        self.historico.append(ciclo)

    def _ips_conhecidos(self) -> set:
        ips = set()
        for ciclo in self.historico:
            ips.update(ciclo.keys())
        return ips

    def _estatisticas_conexoes(self):
        valores = []
        for ciclo in self.historico:
            for entrada in ciclo.values():
                valores.append(entrada["conexoes"])
        if not valores:
            return 0.0, 0.0
        return statistics.mean(valores), statistics.pstdev(valores)

    def pontuar(self, ciclo: dict) -> list:
        if not self.pronto:
            return []
        ips_conhecidos = self._ips_conhecidos()
        media, desvio = self._estatisticas_conexoes()
        achados = []
        for ip, entrada in ciclo.items():
            score = 0
            fatores = []
            if ip not in ips_conhecidos:
                score += 25
                fatores.append("ip_origem_desconhecido")
            limite = media + 3 * desvio if desvio > 0 else max(media * 3, 5)
            if entrada["conexoes"] > limite:
                score += 30
                fatores.append("taxa_de_conexoes_anomala")
            if len(entrada["portas_remotas"]) >= 5:
                score += 30
                fatores.append("varredura_de_portas")
            if self.portas_internas and any(p not in self.portas_internas
                                            for p in entrada["portas_locais"]):
                score += 15
                fatores.append("porta_local_fora_do_padrao")
            incidentes = [self.portas_incidente[p] for p in entrada["portas_locais"]
                          if p in self.portas_incidente]
            if incidentes:
                score += 10
                fatores.append("porta_de_incidente_conhecido:" + ",".join(incidentes))
            score = min(score, 100)
            if score >= self.limiar:
                achados.append({
                    "ip_origem": ip,
                    "score": score,
                    "confianca": min(score, 99),
                    "fatores": fatores,
                    "portas_locais": sorted(entrada["portas_locais"]),
                    "portas_remotas": sorted(entrada["portas_remotas"]),
                    "conexoes": entrada["conexoes"],
                })
        achados.sort(key=lambda a: a["score"], reverse=True)
        return achados


class RegistroIA:
    """Registro append-only de invasores e eventos."""

    def __init__(self, pasta: Path):
        self.pasta = pasta
        self.invasores = pasta / "invasores.jsonl"
        self.eventos = pasta / "eventos_ia.jsonl"
        self.baseline = pasta / "baseline.json"

    def _anexar(self, caminho: Path, objeto: dict) -> None:
        caminho.parent.mkdir(parents=True, exist_ok=True)
        with caminho.open("a", encoding="utf-8") as arquivo:
            arquivo.write(json.dumps(objeto, ensure_ascii=False) + "\n")

    def registrar_invasor(self, achado: dict) -> None:
        self._anexar(self.invasores, {
            "timestamp": agora_iso(),
            "classificacao": "invasor_suspeito",
            "status": "investigacao",
            **achado,
        })

    def registrar_evento(self, achado: dict) -> None:
        varredura = "varredura_de_portas" in achado["fatores"]
        self._anexar(self.eventos, {
            "timestamp": agora_iso(),
            "evento": "varredura_portas_anomala" if varredura else "acesso_anomalo_porta",
            "origem": achado["ip_origem"],
            "portas": achado["portas_locais"],
            "score": achado["score"],
            "fatores": achado["fatores"],
            "detalhe": "anomalia identificada pelo backend de IA",
        })

    def salvar_baseline(self, modelo: ModeloIA) -> None:
        self.baseline.parent.mkdir(parents=True, exist_ok=True)
        self.baseline.write_text(json.dumps({
            "atualizado_em": agora_iso(),
            "ciclos_aprendidos": len(modelo.historico),
            "ips_conhecidos": sorted(modelo._ips_conhecidos()),
        }, ensure_ascii=False, indent=2), encoding="utf-8")


def carregar_ciclos_replay(caminho: Path) -> list:
    if not caminho.exists():
        raise FileNotFoundError(f"Arquivo de entrada nao encontrado: {caminho}")
    ciclos = []
    for numero, linha in enumerate(caminho.read_text(encoding="utf-8").splitlines(), start=1):
        linha = linha.strip()
        if not linha:
            continue
        try:
            objeto = json.loads(linha)
        except json.JSONDecodeError as erro:
            raise ValueError(f"Linha {numero} invalida em {caminho}: {erro}")
        ciclos.append(agregar_ciclo(objeto.get("conexoes", [])))
    return ciclos


def executar_motor() -> int:
    resultado = subprocess.run(
        [sys.executable, str(ESPEC_MOTOR),
         str(RAIZ_IA / "eventos_ia.jsonl"),
         "--saida", str(RAIZ_IA / "alertas_ia.jsonl")],
        capture_output=True, text=True,
    )
    if resultado.returncode not in (0, 2):
        print(f"AVISO: motor retornou {resultado.returncode}: {resultado.stderr.strip()}",
              file=sys.stderr)
    return resultado.returncode


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Backend de IA - RedFlag SICX")
    parser.add_argument("--config", default=str(RAIZ_IA / "config.yaml"))
    parser.add_argument("--entrada", default=None,
                        help="Replay: arquivo JSONL de ciclos em vez do sistema")
    parser.add_argument("--uma-vez", action="store_true", help="Executa um ciclo e sai")
    parser.add_argument("--intervalo", type=int, default=None,
                        help="Segundos entre ciclos (padrao: config.yaml)")
    parser.add_argument("--motor", action="store_true",
                        help="Apos cada ciclo com achado, aciona o motor avaliar_redflags.py")
    parser.add_argument("--pasta-dados", default=str(RAIZ_IA),
                        help="Pasta de saidas append-only (padrao: ia/)")
    parser.add_argument("--token-hash", default=str(RAIZ_REDFLAG / ".acesso" / "operador.sha256"))
    parser.add_argument("--token", default=os.environ.get("REDFLAG_OPERATOR_TOKEN"))
    args = parser.parse_args(argv)

    try:
        verificar_token(args.token, Path(args.token_hash))
    except MOTOR.AcessoNegado as erro:
        print(f"ACESSO NEGADO: {erro}", file=sys.stderr)
        return 1

    try:
        config = carregar_config(Path(args.config))
    except (FileNotFoundError, ValueError) as erro:
        print(f"ERRO: {erro}", file=sys.stderr)
        return 1

    modelo = ModeloIA(config)
    registro = RegistroIA(Path(args.pasta_dados))
    intervalo = args.intervalo or int(config.get("intervalo_segundos", 5))
    porta_santow = (config.get("incidentes", {}) or {}).get("santow", {}).get("porta")
    if not isinstance(porta_santow, int):
        print("AVISO: porta do incidente de santow nao configurada em config.yaml; "
              "monitoramento segue ativo em todas as portas.", file=sys.stderr)

    def um_ciclo(ciclo: dict) -> int:
        resultado_ciclo = 0
        if modelo.pronto:
            achados = modelo.pontuar(ciclo)
            for achado in achados:
                registro.registrar_invasor(achado)
                registro.registrar_evento(achado)
                print(json.dumps({
                    "timestamp": agora_iso(),
                    "invasor_suspeito": achado["ip_origem"],
                    "score": achado["score"],
                    "confianca": achado["confianca"],
                    "fatores": achado["fatores"],
                }, ensure_ascii=False))
            if achados:
                resultado_ciclo = 2
                if args.motor:
                    executar_motor()
        else:
            print(f"[baseline] aprendendo {len(modelo.historico)}/{modelo.min_amostras}")
        modelo.aprender(ciclo)
        registro.salvar_baseline(modelo)
        return resultado_ciclo

    if args.entrada:
        codigo_final = 0
        for ciclo in carregar_ciclos_replay(Path(args.entrada)):
            codigo_final = max(codigo_final, um_ciclo(ciclo))
        return codigo_final

    while True:
        codigo = um_ciclo(agregar_ciclo(coletar_conexoes_sistema()))
        if args.uma_vez:
            return codigo
        time.sleep(intervalo)


if __name__ == "__main__":
    sys.exit(main())
