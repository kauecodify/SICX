# 08 - RACI e SLA

## Papéis

| Papel | Descricao | Titular |
| --- | --- | --- |
| Comandante de incidente | Coordena a resposta e aprova acoes criticas | `<RESPONSAVEL_COMANDO>` |
| Aprovador de disponibilidade | Autoriza acoes que afetem disponibilidade | `<RESPONSAVEL_APROVADOR>` |
| Rede | Executa isolamento e bloqueio de egress | `<RESPONSAVEL_REDE>` |
| Acesso | Executa resets de credencial e invalidacao de sessoes | `<RESPONSAVEL_ACESSO>` |
| Dados | Executa validacao de backups e recuperacao | `<RESPONSAVEL_DADOS>` |
| Monitoramento | Executa threat hunting e acompanha alertas | `<RESPONSAVEL_MONITORAMENTO>` |
| Evidencias | Coleta, hash e cadeia de custodia | `<RESPONSAVEL_EVIDENCIAS>` |

## RACI por atividade

| Atividade | Comandante | Rede | Acesso | Dados | Monitoramento | Evidencias |
| --- | --- | --- | --- | --- | --- | --- |
| Declarar incidente | A | C | I | I | C | I |
| Coletar evidencias | A | I | I | C | I | R |
| Isolar rede (PB-01) | A | R | I | I | C | C |
| Reset de credenciais (PB-02) | A | I | R | I | C | I |
| Restaurar backup (PB-03) | A | I | I | R | C | C |
| Verificar hashes (PB-04) | A | I | I | R | C | C |
| Proteger logs (PB-05) | A | I | I | R | C | C |
| EDR e hunting (PB-06) | A | C | I | I | R | C |
| Honeypots e varredura (PB-07) | A | C | I | I | R | I |

A = aprovador, R = responsavel pela execucao, C = consultado, I = informado.

## SLA por severidade

| Severidade | Acionamento | Primeira acao | Atualizacao de status |
| --- | --- | --- | --- |
| Critica | Imediato | 15 minutos | A cada 30 minutos |
| Alta | Imediato | 30 minutos | A cada 1 hora |
| Media | 4 horas | 8 horas | A cada 4 horas |
| Baixa | 24 horas | 48 horas | Diaria |

SLAs por RedFlag especifica estao na matriz (`06-matriz-redflags.md`).
Estouro de SLA deve ser reportado ao comandante e destacado no painel.
