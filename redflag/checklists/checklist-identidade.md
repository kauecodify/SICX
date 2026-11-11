# Checklist de identidade (Acesso)

Camada: Acesso. Playbook: PB-02. RedFlags: RF-ACC-01, RF-ACC-02, RF-ACC-03, RF-RED-02.

## Inventário

- [ ] Contas administrativas e de servico inventariadas
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<INVENTARIO_CREDENCIAIS>`
- [ ] Tokens e chaves de API ativos inventariados
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`

## Reset de credenciais (RF-ACC-01)

- [ ] Contas de servico resetadas
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<LOG_IDENTIDADE>`
- [ ] Contas administrativas resetadas
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<LOG_IDENTIDADE>`
- [ ] Contas de usuario final resetadas
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<LOG_IDENTIDADE>`

## Sessoes (RF-ACC-02)

- [ ] Sessoes suspeitas identificadas (ID, IP, user agent)
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`
- [ ] Sessoes invalidadas (dry-run antes da execucao real)
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`
- [ ] Aprovacao registrada
  - Aprovador: `<RESPONSAVEL_APROVADOR>` | Data/hora: `<DATA_HORA>`

## Privilegios (RF-ACC-03)

- [ ] Superusuarios revisados e reduzidos ao minimo necessario
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`

## Validacao

- [ ] Nenhuma credencial pre-incidente valida
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`
- [ ] MFA exigido na reautenticacao de contas privilegiadas
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`
