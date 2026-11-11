#!/usr/bin/env bash
#
# reset_sessoes.sh - Invalidacao de sessoes ativas no SICX.
#
# Objetivo:
#     Exemplo de invalidacao de sessoes ativas de um usuario ou de todos
#     os usuarios, forçando reautenticacao apos indicio de session
#     hijacking (RedFlag RF-ACC-02).
#
# Risco:
#     ALTO. Afeta DISPONIBILIDADE: todos os usuarios afetados perdem a
#     sessao atual. NUNCA execute sem aprovacao humana registrada.
#
# Pre-requisitos:
#     - Executar no host da aplicacao ou com acesso ao armazenamento de
#       sessoes da aplicacao (ajuste SESSAO_DIR ao ambiente real).
#     - Aprovacao registrada em docs/02-runbook-contencao.md.
#
# Modo dry-run:
#     DRY_RUN=1 ./reset_sessoes.sh <USUARIO>
#     Lista as sessoes que seriam invalidadas sem alterar nada.
#
# Uso:
#     APROVADO_POR="<RESPONSAVEL>" ./reset_sessoes.sh <USUARIO>
#     APROVADO_POR="<RESPONSAVEL>" ./reset_sessoes.sh --todos
#
# No SICX de exemplo, as sessoes sao arquivos sob SESSAO_DIR. Adapte a
# variavel e o mecanismo de invalidacao (Redis, banco, JWT denylist) ao
# ambiente real antes de qualquer uso.

set -euo pipefail

ALVO="${1:-<USUARIO>}"
APROVADO_POR="${APROVADO_POR:-}"
DRY_RUN="${DRY_RUN:-0}"
SESSAO_DIR="${SESSAO_DIR:-/var/lib/sicx/sessoes}"

echo "=== Invalidacao de sessoes - SICX RedFlag ==="
echo "Alvo: ${ALVO}"
echo "Aprovado por: ${APROVADO_POR:-NENHUM}"

if [ -z "${APROVADO_POR}" ] && [ "${DRY_RUN}" != "1" ]; then
    echo "ERRO: execucao real exige APROVADO_POR=\"<RESPONSAVEL>\"." >&2
    echo "Impacto: usuarios perderao a sessao atual. Use DRY_RUN=1 para simular." >&2
    exit 1
fi

listar_sessoes() {
    if [ "${ALVO}" = "--todos" ]; then
        find "${SESSAO_DIR}" -type f 2>/dev/null
    else
        find "${SESSAO_DIR}" -type f -name "*${ALVO}*" 2>/dev/null
    fi
}

echo "[*] Sessoes encontradas:"
listar_sessoes | tee /dev/stderr | wc -l

if [ "${DRY_RUN}" = "1" ]; then
    echo "[DRY-RUN] Nenhuma sessao foi invalidada."
    exit 0
fi

echo "[!] Invalidando sessoes. Esta acao foi aprovada por ${APROVADO_POR}."
listar_sessoes | while read -r sessao; do
    rm -f "${sessao}"
    echo "[-] Sessao invalidada: ${sessao}"
done

echo "=== Fim. Registre a aprovacao e o resultado no runbook de contencao. ==="
