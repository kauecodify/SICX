# Checklist de contencao (Rede)

Camada: Rede. Playbooks: PB-01. RedFlags: RF-RED-01, RF-RED-02, RF-RED-03.

## Coleta inicial

- [ ] Registro de incidente aberto com horario de inicio (UTC)
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`
- [ ] Evidencias coletadas antes de contencao invasiva
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<MANIFESTO_SHA256>`

## Bloqueio de egress (RF-RED-03)

- [ ] Destinos suspeitos identificados (`<IP_SUSPEITO>`)
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<LOG_FIREWALL>`
- [ ] Bloqueio aplicado (simulacao antes da execucao real)
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<REGRA_FIREWALL>`
- [ ] Aprovacao registrada
  - Aprovador: `<RESPONSAVEL_APROVADOR>` | Data/hora: `<DATA_HORA>`

## Isolamento de hosts (RF-RED-01)

- [ ] Hosts com movimentacao lateral isolados em quarentena de rede
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`
- [ ] Nenhum host reinicializado antes da coleta
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>`

## Endpoints e tokens (RF-RED-02)

- [ ] Tokens e endpoints externos ativos inventariados
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`

## Validacao

- [ ] Sem novas conexoes para destinos bloqueados
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<LOG_FIREWALL>`
- [ ] Sem novos alertas de RF-RED-01/03 apos bloqueio
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<ALERTS_JSONL>`
