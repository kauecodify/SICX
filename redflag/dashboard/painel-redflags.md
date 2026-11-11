# Painel de RedFlags

Painel de acompanhamento da mitigacao. A interface web esta em
`index.html` (uso interno, com bloqueio de acesso para usuarios externos).

## Fonte de dados

- `alerts.jsonl` gerado por `scripts/avaliar_redflags.py` (append-only).
- Consultas de exemplo: `consultas.kql`.

## Componentes do painel

| Componente | Conteudo |
| --- | --- |
| Contadores por severidade | Total, critica, alta, media, baixa |
| Contadores por camada | Rede, Acesso, Dados, Monitoramento |
| SLA estourado | Alertas com `sla` vencido sem tratativa registrada |
| Playbooks acionados | Execucoes por playbook (PB-01 a PB-07) |
| Status de contencao | Em andamento, contido, rollback, encerrado |

## Interpretacao

- `Critica > 0`: acionar imediatamente o runbook de contencao
  (`docs/02-runbook-contencao.md`).
- `SLA estourado > 0`: escalar ao comandante de incidente.
- `Status de contencao = contido`: prosseguir para validacao e
  recuperacao (PB-03, PB-04).

## Atualizacao

O painel le `alerts.jsonl` a cada carregamento. Novos alertas aparecem
apos nova execucao do motor. O arquivo nunca e truncado; filtros por
periodo limitam a visao.
