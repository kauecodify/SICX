# 06 - Matriz de RedFlags

Fonte oficial das regras: `redflags/redflags.yaml`. A regra RF-IA-01 e
alimentada pelo backend de IA (`ia/backend.py`), que monitora todas as
portas em tempo real, incluindo a porta do incidente de santow
(configuravel em `ia/config.yaml`).
Schema de validacao: `redflags/schema.json`.

| Camada | RedFlag | Severidade | Acao Imediata | Playbook | SLA | Aprovacao |
| --- | --- | --- | --- | --- | --- | --- |
| Rede | RF-RED-01 - Movimentacao lateral entre servidor de aplicacao e banco de dados ou outros servidores | Critica | Isolar o host de origem na rede e preservar evidencias | PB-01 | 15m | Sim |
| Rede | RF-RED-02 - Endpoint de API externo ou token de acesso ativo apos o incidente | Alta | Revogar token e desativar endpoint exposto | PB-02 | 1h | Sim |
| Rede | RF-RED-03 - Trafego egress para IP desconhecido ou suspeito de C2 | Critica | Bloquear egress e capturar trafego restante | PB-01 | 15m | Sim |
| Acesso | RF-ACC-01 - Credencial administrativa ou de servico sem reset apos o incidente | Critica | Resetar credencial e invalidar dependentes | PB-02 | 4h | Sim |
| Acesso | RF-ACC-02 - Sessao ativa suspeita ou indicio de session hijacking | Alta | Invalidar sessao e exigir reautenticacao com MFA | PB-02 | 30m | Sim |
| Acesso | RF-ACC-03 - Conta com privilegio de superusuario fora do minimo necessario | Media | Reduzir privilegios mediante aprovacao | PB-02 | 24h | Sim |
| Dados | RF-DAT-01 - Backup sem validacao de integridade ou sem copia air-gapped | Alta | Suspender uso do backup e acionar validacao | PB-03 | 8h | Sim |
| Dados | RF-DAT-02 - Hash de binario ou biblioteca divergente do original | Critica | Quarentena do artefato e comparacao com original | PB-04 | 2h | Sim |
| Dados | RF-DAT-03 - Log apagado, alterado ou ausente em servidor de logs imutavel | Critica | Preservar estado do servidor de logs e abrir cadeia de custodia | PB-05 | 1h | Sim |
| Monitoramento | RF-MON-01 - Execucao suspeita de PowerShell ou comportamento anomalo no EDR | Alta | Isolar endpoint no EDR e coletar telemetria | PB-06 | 30m | Sim |
| Monitoramento | RF-MON-02 - Acesso a honeypot interno ou arquivo isca | Critica | Tratar origem como comprometida e acionar threat hunting | PB-07 | 15m | Sim |
| Monitoramento | RF-MON-03 - Vulnerabilidade critica exploravel identificada em varredura | Media | Priorizar correcao ou compensacao | PB-07 | 48h | Sim |
| Monitoramento | RF-IA-01 - Varredura ou acesso anomalo a porta detectado pela IA | Alta | Investigar origem classificada como invasor suspeito | PB-07 | 30m | Sim |

Notas:

- Todas as acoes exigem aprovacao humana registrada.
- SLA contado a partir do registro do alerta em `alerts.jsonl`.
- Estouro de SLA deve ser visivel no painel (`dashboard/painel-redflags.md`).
