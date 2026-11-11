# -*- coding: utf-8 -*-
"""Testes do motor de avaliacao de RedFlags do SICX.

Execucao:
    cd redflag
    python3 -m unittest discover -s tests -v

Compativel tambem com pytest:
    python3 -m pytest tests/test_avaliar_redflags.py -v
"""

import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parent.parent
CAMINHO_MOTOR = RAIZ / "scripts" / "avaliar_redflags.py"
CAMINHO_REGRAS = RAIZ / "redflags" / "redflags.yaml"
CAMINHO_CASOS = RAIZ / "tests" / "casos_teste.yaml"


def _carregar_motor():
    spec = importlib.util.spec_from_file_location("avaliar_redflags", CAMINHO_MOTOR)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


MOTOR = _carregar_motor()
TOKEN_TESTE = "token-operador-teste"


class MotorRedFlagsTestCase(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.dir_temp = Path(self.temp.name)
        self.hash_token = self.dir_temp / "operador.sha256"
        self.hash_token.write_text(
            hashlib.sha256(TOKEN_TESTE.encode()).hexdigest(), encoding="utf-8"
        )
        self.saida = self.dir_temp / "alerts.jsonl"
        self.log = self.dir_temp / "execucoes.log"

    def tearDown(self):
        self.temp.cleanup()

    def executar(self, eventos, token=TOKEN_TESTE):
        arquivo_eventos = self.dir_temp / "eventos.jsonl"
        arquivo_eventos.write_text(
            "\n".join(json.dumps(e, ensure_ascii=False) for e in eventos) + "\n",
            encoding="utf-8",
        )
        return MOTOR.main([
            str(arquivo_eventos),
            "--regras", str(CAMINHO_REGRAS),
            "--saida", str(self.saida),
            "--token-hash", str(self.hash_token),
            "--log-execucao", str(self.log),
            "--token", token,
        ])

    def alertas_registrados(self):
        if not self.saida.exists():
            return []
        return [json.loads(l) for l in self.saida.read_text(encoding="utf-8").splitlines() if l.strip()]


class ControleDeAcessoTest(MotorRedFlagsTestCase):
    def test_token_ausente_recusa_execucao(self):
        codigo = self.executar([{"evento": "egress_suspeito"}], token=None)
        self.assertEqual(codigo, 1)
        self.assertFalse(self.saida.exists())

    def test_token_invalido_recusa_execucao(self):
        codigo = self.executar([{"evento": "egress_suspeito"}], token="token-errado")
        self.assertEqual(codigo, 1)
        self.assertFalse(self.saida.exists())

    def test_hash_ausente_recusa_execucao(self):
        codigo = MOTOR.main([
            str(self.dir_temp / "eventos.jsonl"),
            "--regras", str(CAMINHO_REGRAS),
            "--saida", str(self.saida),
            "--token-hash", str(self.dir_temp / "inexistente.sha256"),
            "--token", TOKEN_TESTE,
            "--log-execucao", str(self.log),
        ])
        self.assertEqual(codigo, 1)


class AvaliacaoTest(MotorRedFlagsTestCase):
    def test_regra_critica_retorna_codigo_2_e_gera_alerta(self):
        codigo = self.executar([
            {"timestamp": "2025-01-01T10:00:00Z", "evento": "movimentacao_lateral",
             "origem": "<HOSTNAME_APP>", "destino": "banco_dados"},
        ])
        self.assertEqual(codigo, 2)
        alertas = self.alertas_registrados()
        self.assertEqual(len(alertas), 1)
        alerta = alertas[0]
        self.assertEqual(alerta["redflag"], "RF-RED-01")
        self.assertEqual(alerta["severidade"], "critica")
        self.assertIn("timestamp", alerta)
        self.assertIn("acao_recomendada", alerta)
        self.assertIn("playbook", alerta)
        self.assertTrue(alerta["requer_aprovacao_humana"])

    def test_sem_redflag_critica_retorna_codigo_0(self):
        codigo = self.executar([
            {"timestamp": "2025-01-01T10:00:00Z", "evento": "superusuario_excessivo",
             "origem": "<USUARIO>"},
        ])
        self.assertEqual(codigo, 0)
        alertas = self.alertas_registrados()
        self.assertEqual(len(alertas), 1)
        self.assertEqual(alertas[0]["severidade"], "media")

    def test_evento_sem_correspondencia_nao_gera_alerta(self):
        codigo = self.executar([
            {"timestamp": "2025-01-01T10:00:00Z", "evento": "backup_concluido",
             "origem": "<REPOSITORIO_BACKUP>"},
        ])
        self.assertEqual(codigo, 0)
        self.assertEqual(self.alertas_registrados(), [])

    def test_registro_append_only_nunca_trunca(self):
        evento = {"timestamp": "2025-01-01T10:00:00Z", "evento": "honeypot_acessado",
                  "origem": "<HOSTNAME_APP>"}
        self.executar([evento])
        self.executar([evento])
        linhas = self.saida.read_text(encoding="utf-8").splitlines()
        self.assertEqual(len(linhas), 2)

    def test_log_de_execucao_append_only(self):
        evento = {"timestamp": "2025-01-01T10:00:00Z", "evento": "egress_suspeito",
                  "origem": "<HOSTNAME_APP>"}
        self.executar([evento])
        self.executar([evento])
        linhas = self.log.read_text(encoding="utf-8").splitlines()
        self.assertEqual(len(linhas), 2)


class CasosDeTesteDeclarativosTest(MotorRedFlagsTestCase):
    def setUp(self):
        super().setUp()
        dados = yaml.safe_load(CAMINHO_CASOS.read_text(encoding="utf-8"))
        self.casos = dados["casos"]
        self.regras = MOTOR.carregar_regras(CAMINHO_REGRAS)

    def test_casos_declarativos(self):
        self.assertGreaterEqual(len(self.casos), 12)
        for caso in self.casos:
            with self.subTest(caso=caso["nome"]):
                alertas = MOTOR.avaliar([caso["evento"]], self.regras)
                ids = {a["redflag"] for a in alertas}
                esperada = caso["redflag_esperada"]
                if caso["deve_disparar"]:
                    self.assertIn(esperada, ids, caso["nome"])
                    alerta = next(a for a in alertas if a["redflag"] == esperada)
                    self.assertEqual(alerta["severidade"], caso["severidade_esperada"])
                else:
                    self.assertNotIn(esperada, ids, caso["nome"])

    def test_regras_cobrem_quatro_camadas(self):
        categorias = {r["categoria"] for r in self.regras}
        self.assertEqual(categorias, {"rede", "acesso", "dados", "monitoramento"})

    def test_todas_as_regras_exigem_aprovacao_humana(self):
        for regra in self.regras:
            self.assertTrue(regra["requer_aprovacao_humana"], regra["id"])


if __name__ == "__main__":
    unittest.main()
