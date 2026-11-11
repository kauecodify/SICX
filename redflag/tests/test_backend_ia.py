# -*- coding: utf-8 -*-
"""Testes do backend de IA (varredura de portas e identificacao de invasor).

Execucao:
    cd redflag
    python3 -m unittest discover -s tests -v
"""

import hashlib
import json
import tempfile
import unittest
from pathlib import Path

import importlib.util

RAIZ = Path(__file__).resolve().parent.parent
CAMINHO_BACKEND = RAIZ / "ia" / "backend.py"
CAMINHO_REGRAS = RAIZ / "redflags" / "redflags.yaml"

TOKEN_TESTE = "token-operador-teste"


def _carregar_backend():
    spec = importlib.util.spec_from_file_location("backend_ia", CAMINHO_BACKEND)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


BACKEND = _carregar_backend()

CONFIG_TESTE = """
min_amostras_baseline: 3
limiar_anomalia: 70
portas_servicos_internas: [22, 80]
incidentes:
  santow:
    porta: "<PORTA_INCIDENTE_SANTOW>"
    descricao: "Porta afetada no incidente de santow"
"""


def ciclo_normal(ip="10.0.0.5"):
    return {"conexoes": [{"porta_local": 22, "ip_origem": ip,
                          "porta_remota": 51000, "estado": "ESTAB"}]}


def ciclo_invasor():
    conexoes = []
    for porta_remota in range(40000, 40006):
        conexoes.append({"porta_local": 3306, "ip_origem": "203.0.113.50",
                         "porta_remota": porta_remota, "estado": "ESTAB"})
    return {"conexoes": conexoes}


class BackendIATestCase(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.dir_temp = Path(self.temp.name)
        self.dados = self.dir_temp / "dados"
        self.hash_token = self.dir_temp / "operador.sha256"
        self.hash_token.write_text(
            hashlib.sha256(TOKEN_TESTE.encode()).hexdigest(), encoding="utf-8"
        )
        self.config = self.dir_temp / "config.yaml"
        self.config.write_text(CONFIG_TESTE, encoding="utf-8")

    def tearDown(self):
        self.temp.cleanup()

    def executar(self, ciclos, token=TOKEN_TESTE, motor=False):
        arquivo_entrada = self.dir_temp / "ciclos.jsonl"
        arquivo_entrada.write_text(
            "\n".join(json.dumps(c) for c in ciclos) + "\n", encoding="utf-8"
        )
        argv = [
            "--config", str(self.config),
            "--entrada", str(arquivo_entrada),
            "--pasta-dados", str(self.dados),
            "--token-hash", str(self.hash_token),
            "--token", token,
        ]
        if motor:
            argv.append("--motor")
        return BACKEND.main(argv)

    def invasores(self):
        arquivo = self.dados / "invasores.jsonl"
        if not arquivo.exists():
            return []
        return [json.loads(l) for l in arquivo.read_text(encoding="utf-8").splitlines() if l.strip()]

    def eventos(self):
        arquivo = self.dados / "eventos_ia.jsonl"
        if not arquivo.exists():
            return []
        return [json.loads(l) for l in arquivo.read_text(encoding="utf-8").splitlines() if l.strip()]


class ControleDeAcessoIATest(BackendIATestCase):
    def test_token_ausente_recusa_execucao(self):
        codigo = self.executar([ciclo_normal()], token=None)
        self.assertEqual(codigo, 1)
        self.assertFalse((self.dados / "invasores.jsonl").exists())

    def test_token_invalido_recusa_execucao(self):
        codigo = self.executar([ciclo_normal()], token="token-errado")
        self.assertEqual(codigo, 1)


class DeteccaoIATest(BackendIATestCase):
    def test_fase_de_aprendizado_nao_classifica(self):
        codigo = self.executar([ciclo_normal() for _ in range(2)])
        self.assertEqual(codigo, 0)
        self.assertEqual(self.invasores(), [])

    def test_invasor_identificado_em_anomalia(self):
        ciclos = [ciclo_normal() for _ in range(3)] + [ciclo_invasor()]
        codigo = self.executar(ciclos)
        self.assertEqual(codigo, 2)
        invasores = self.invasores()
        self.assertEqual(len(invasores), 1)
        invasor = invasores[0]
        self.assertEqual(invasor["ip_origem"], "203.0.113.50")
        self.assertEqual(invasor["classificacao"], "invasor_suspeito")
        self.assertGreaterEqual(invasor["score"], 70)
        self.assertIn("ip_origem_desconhecido", invasor["fatores"])
        self.assertIn("varredura_de_portas", invasor["fatores"])

    def test_evento_normalizado_para_o_motor(self):
        ciclos = [ciclo_normal() for _ in range(3)] + [ciclo_invasor()]
        self.executar(ciclos)
        eventos = self.eventos()
        self.assertEqual(len(eventos), 1)
        self.assertEqual(eventos[0]["evento"], "varredura_portas_anomala")
        self.assertEqual(eventos[0]["origem"], "203.0.113.50")

    def test_origem_conhecida_sem_anomalia_nao_gera_invasor(self):
        ciclos = [ciclo_normal() for _ in range(3)] + [ciclo_normal()]
        codigo = self.executar(ciclos)
        self.assertEqual(codigo, 0)
        self.assertEqual(self.invasores(), [])

    def test_registro_append_only(self):
        ciclos = [ciclo_normal() for _ in range(3)] + [ciclo_invasor()]
        self.executar(ciclos)
        self.executar(ciclos)
        linhas = (self.dados / "invasores.jsonl").read_text(encoding="utf-8").splitlines()
        self.assertEqual(len(linhas), 2)


class IntegracaoMotorTest(BackendIATestCase):
    def test_regra_rf_ia_01_existe_e_corresponde(self):
        regras = BACKEND.MOTOR.carregar_regras(CAMINHO_REGRAS)
        regra = next(r for r in regras if r["id"] == "RF-IA-01")
        evento = {"evento": "varredura_portas_anomala", "origem": "<IP_SUSPEITO>"}
        self.assertTrue(BACKEND.MOTOR.evento_corresponde(evento, regra["condicao"]))
        alertas = BACKEND.MOTOR.avaliar([evento], regras)
        self.assertEqual(alertas[0]["severidade"], "alta")
        self.assertTrue(alertas[0]["requer_aprovacao_humana"])


if __name__ == "__main__":
    unittest.main()
