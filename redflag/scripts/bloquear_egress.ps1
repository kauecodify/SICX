<#
.SYNOPSIS
    bloquear_egress.ps1 - Bloqueio de trafego de saida para IPs desconhecidos no SICX.

.DESCRIPTION
    Exemplo de contencao de egress via Windows Firewall. Cria regras de
    bloqueio para os IPs informados e, opcionalmente, ativa o modo
    restritivo de saida (apenas destinos explicitamente permitidos).

    ATENCAO: ativar o modo restritivo afeta DISPONIBILIDADE. Exige
    aprovacao humana registrada antes da execucao (ver
    docs/02-runbook-contencao.md e playbooks/PB-01-isolamento-rede.md).

.PARAMETER IPs
    Lista de IPs ou CIDRs a bloquear. Use placeholders em simulacao,
    por exemplo: <IP_SUSPEITO>.

.PARAMETER Simulacao
    Modo dry-run. Mostra as regras que seriam criadas sem aplicar nada.

.PARAMETER ModoRestritivo
    ATENCAO: altera a politica padrao de saida para Block. Requer
    aprovacao registrada.

.EXAMPLE
    .\bloquear_egress.ps1 -IPs @("<IP_SUSPEITO>") -Simulacao

.EXAMPLE
    .\bloquear_egress.ps1 -IPs @("<IP_SUSPEITO>") -AprovadoPor "<RESPONSAVEL>"
#>
param(
    [Parameter(Mandatory = $true)]
    [string[]]$IPs,

    [switch]$Simulacao,

    [switch]$ModoRestritivo,

    [string]$AprovadoPor = ""
)

$ErroActionPreference = "Stop"

if (-not $Simulacao -and -not $AprovadoPor) {
    Write-Error "Execucao real exige -AprovadoPor '<RESPONSAVEL>'. Use -Simulacao para dry-run."
    exit 1
}

Write-Host "=== Bloqueio de egress - SICX RedFlag ==="
Write-Host "Modo: $(if ($Simulacao) { 'SIMULACAO (dry-run)' } else { 'EXECUCAO REAL' })"
Write-Host "Aprovado por: $(if ($AprovadoPor) { $AprovadoPor } else { 'N/A (simulacao)' })"

foreach ($ip in $IPs) {
    $nomeRegra = "SICX-RedFlag-Bloqueio-Egress-$($ip -replace '[^0-9a-zA-Z]', '_')"
    if ($Simulacao) {
        Write-Host "[DRY-RUN] Criaria regra: $nomeRegra bloqueando saida para $ip"
        continue
    }

    New-NetFirewallRule -DisplayName $nomeRegra `
        -Direction Outbound `
        -Action Block `
        -RemoteAddress $ip `
        -Profile Any | Out-Null
    Write-Host "[OK] Regra criada: $nomeRegra -> $ip"
}

if ($ModoRestritivo) {
    if ($Simulacao) {
        Write-Host "[DRY-RUN] Alteraria a politica padrao de saida para Block (IMPACTO EM DISPONIBILIDADE)"
    }
    elseif ($AprovadoPor) {
        Set-NetFirewallProfile -All -DefaultOutboundAction Block
        Write-Host "[OK] Politica padrao de saida alterada para Block. Aprovado por $AprovadoPor"
    }
}

Write-Host "=== Fim. Registre esta execucao na cadeia de custodia. ==="
