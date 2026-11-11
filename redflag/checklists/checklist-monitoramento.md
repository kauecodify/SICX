# Checklist de monitoramento

Camada: Monitoramento. Playbooks: PB-06, PB-07. RedFlags: RF-MON-01, RF-MON-02, RF-MON-03.

## EDR (RF-MON-01)

- [ ] Endpoints com execucao suspeita isolados no EDR
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<TELEMETRIA_EDR>`
- [ ] Telemetria exportada (linha de comando, processo pai, hash)
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`
- [ ] Padrao suspeito buscado em todos os endpoints
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`

## Honeypots (RF-MON-02)

- [ ] Acessos a honeypots/arquivos isca revisados
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<LOG_HONEYPOT>`
- [ ] Hosts de origem tratados como comprometidos
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`

## Varredura (RF-MON-03)

- [ ] Varredura executada nos hosts afetados
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<RELATORIO_VARREDURA>`
- [ ] Vulnerabilidades criticas priorizadas com prazo
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`

## Threat hunting

- [ ] Hipoteses de persistencia, movimento lateral e exfiltracao verificadas
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`
- [ ] Achados registrados como eventos JSONL e reavaliados pelo motor
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<ALERTS_JSONL>`

## Validacao

- [ ] Sem novos alertas criticos em janela acordada
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<ALERTS_JSONL>`
