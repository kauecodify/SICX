# 02 - Runbook de contencao

## Quando acionar

Ao primeiro alerta de RedFlag critica ou alta, ou mediante indicio manual de
comprometimento ativo (movimentacao lateral, egress suspeito, execucao
anomala).

## Papel de comando

- Comandante do incidente: `<RESPONSAVEL_COMANDO>`
- Aprovador de acoes que afetem disponibilidade: `<RESPONSAVEL_APROVADOR>`
- Registro e evidencias: `<RESPONSAVEL_EVIDENCIAS>`

## Sequencia padrao

1. Registrar o horario de inicio e abrir o registro de incidente.
2. Coletar evidencias ANTES de contencao invasiva:
   `scripts/coletar_evidencias.sh "<HOSTNAME>"`.
3. Avaliar eventos: `scripts/avaliar_redflags.py <EVENTOS.jsonl>`.
4. Tratar RedFlags criticas primeiro (ver `06-matriz-redflags.md`).
5. Executar playbooks na ordem: PB-01, PB-02, PB-05, PB-03, PB-04, PB-06, PB-07.
6. Registrar cada acao: horario, responsavel, aprovacao e resultado.

## Regras de contencao

- Isolamento de rede precede desligamento. Prefira isolar a desligar.
- Nenhuma reinicializacao antes da coleta de evidencias.
- Bloqueio de egress e revogacao de credenciais exigem aprovacao registrada.
- Toda acao segue o playbook correspondente e seu criterio de rollback.

## Registro obrigatorio

Para cada acao, registrar em `<REGISTRO_INCIDENTE>`:

- Data/hora (UTC), acao executada, script ou playbook usado.
- Aprovador e forma de aprovacao.
- Evidencias geradas e seus hashes (ver `07-evidencias-e-cadeia-de-custodia.md`).

## Encerramento da fase de contencao

Contencao encerra quando: nenhuma RedFlag critica ativa, egress controlado,
credenciais resetadas, sessoes invalidadas e evidencias preservadas com
manifesto de integridade.
