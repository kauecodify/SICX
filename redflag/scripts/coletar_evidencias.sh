#!/usr/bin/env bash
#
# coletar_evidencias.sh - Coleta de evidencias pos-incidente no SICX.
#
# Objetivo:
#     Coletar logs, processos, conexoes de rede e hashes dos arquivos
#     indicados, salvando tudo em uma pasta com timestamp e gerando um
#     manifesto de integridade (SHA-256) de todo o conteudo coletado.
#
# Risco:
#     Baixo. Somente leitura. Nao altera, move ou apaga nada no host.
#     A coleta deve ocorrer ANTES de qualquer acao de contencao invasiva.
#
# Pre-requisitos:
#     - Executar como root ou usuario com permissao de leitura dos logs.
#     - Destino em volume com espaco suficiente (padrao: /tmp/evidencias).
#     - Ferramentas: sha256sum, ps, ss ou netstat, dmesg.
#
# Modo dry-run:
#     DRY_RUN=1 ./coletar_evidencias.sh "<HOSTNAME>"
#     Lista as etapas sem gravar nada em disco.
#
# Uso:
#     sudo ./coletar_evidencias.sh "<HOSTNAME>" [PASTA_DESTINO]
#
# Apos a execucao:
#     1. Copie a pasta para midia de armazenamento controlada.
#     2. Registre a transferencia em docs/07-evidencias-e-cadeia-de-custodia.md.
#     3. Nunca edite os arquivos coletados; trabalhe sempre sobre copias.

set -euo pipefail

HOST="${1:-<HOSTNAME>}"
DESTINO="${2:-/tmp/evidencias}"
DRY_RUN="${DRY_RUN:-0}"
PASTA="${DESTINO}/${HOST}_$(date -u +%Y%m%dT%H%M%SZ)"

echo "[*] Host alvo: ${HOST}"
echo "[*] Pasta de coleta: ${PASTA}"
if [ "${DRY_RUN}" = "1" ]; then
    echo "[DRY-RUN] Nenhuma alteracao sera gravada."
fi

mkdir_cmd() {
    if [ "${DRY_RUN}" = "1" ]; then echo "[DRY-RUN] mkdir -p ${PASTA}"; else mkdir -p "${PASTA}"; fi
}

coletar() {
    local nome="$1"; shift
    if [ "${DRY_RUN}" = "1" ]; then
        echo "[DRY-RUN] coletar ${nome}: $*"
    else
        "$@" > "${PASTA}/${nome}.txt" 2>&1 || echo "[!] Falha parcial ao coletar ${nome}"
    fi
}

mkdir_cmd

if [ "${DRY_RUN}" != "1" ]; then
    cp -a /var/log "${PASTA}/var_log" 2>/dev/null || echo "[!] /var/log parcialmente inacessivel"
fi

coletar processos ps auxww
coletar conexoes bash -c 'ss -tunap 2>/dev/null || netstat -tunap 2>/dev/null'
coletar roteamento bash -c 'ip route 2>/dev/null || route -n 2>/dev/null'
coletar usuarios bash -c 'who -a 2>/dev/null; last -n 50 2>/dev/null'
coletar kernel dmesg
coletar cron bash -c 'cat /etc/crontab 2>/dev/null; ls -la /etc/cron.d 2>/dev/null'
coletar servicos systemctl list-units --type=service --all

if [ "${DRY_RUN}" = "1" ]; then
    echo "[DRY-RUN] Coleta simulada com sucesso."
    exit 0
fi

echo "[*] Gerando manifesto de integridade..."
cd "${PASTA}"
find . -type f ! -name MANIFESTO.sha256 -exec sha256sum {} \; > MANIFESTO.sha256

echo "[*] Coleta concluida em ${PASTA}"
echo "[*] Verifique o manifesto: sha256sum -c MANIFESTO.sha256"
