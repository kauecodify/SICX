# PB-01 - Isolamento de rede

Camada: Rede. RedFlags associadas: RF-RED-01, RF-RED-03.

## Quando acionar

- Movimentacao lateral entre servidores (RF-RED-01).
- Egress para IP desconhecido ou suspeito de C2 (RF-RED-03).

## Pre-requisitos

- Aprovacao do comandante de incidente (`<RESPONSAVEL_COMANDO>`).
- Evidencias basicas coletadas (`scripts/coletar_evidencias.sh`) ou coleta
  simultanea em andamento.
- Acesso ao firewall/segmentacao: `<FERRAMENTA_REDE>`.

## Passos de contencao

1. Registrar horario e aprovador.
2. Bloquear egress para os destinos suspeitos. Em Windows, usar
   `scripts/bloquear_egress.ps1` (iniciar em modo `-Simulacao`).
3. Isolar o host de origem na rede (quarentena de VLAN/ACL), preservando
   o acesso do time de resposta.
4. Manter o host ligado: nao reinicializar antes da coleta completa.
5. Reavaliar eventos com o motor RedFlag apos o bloqueio.

## Preservacao de evidencias

- Capturar trafego restante do host isolado antes de qualquer mudanca.
- Registrar regras de firewall criadas e seus horarios.
- Registrar `MANIFESTO.sha256` da coleta.

## Validacao

- Sem novas conexoes para `<IP_SUSPEITO>` nos logs de firewall.
- Host isolado sem conexoes a outros servidores internos.
- Nenhum alerta novo de RF-RED-01/RF-RED-03 apos o bloqueio.

## Criterios de rollback

- Falso positivo confirmado: remover regras criadas, documentando horario
  e aprovador.
- Rollback de isolamento so apos verificacao de integridade do host
  (PB-04) e aprovacao do comandante.

## Responsaveis

- Execucao: `<RESPONSAVEL_REDE>`.
- Aprovacao: `<RESPONSAVEL_COMANDO>`.

## Registro obrigatorio

Horario, regras aplicadas, aprovador, evidencias geradas e resultado da
validacao em `<REGISTRO_INCIDENTE>`.
