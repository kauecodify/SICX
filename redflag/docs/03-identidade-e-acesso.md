# 03 - Identidade e acesso

## Objetivo

Eliminar a reutilizacao de credenciais comprometidas e reduzir a superficie
de acesso durante e apos o incidente.

## Prioridades

1. Resetar credenciais administrativas e de servico (RF-ACC-01).
2. Invalidar sessoes ativas suspeitas (RF-ACC-02).
3. Reduzir privilegios de superusuario ao minimo necessario (RF-ACC-03).
4. Revogar tokens e chaves de API ativos desde antes do incidente (RF-RED-02).

## Diretrizes

- Reset em ordem de criticidade: contas de servico, administradores,
  usuarios finais.
- Invalidar todas as sessoes ativas ao resetar credencial (ver
  `scripts/reset_sessoes.sh`, com aprovacao).
- Exigir MFA na reautenticacao de contas privilegiadas.
- Inventariar credenciais antes de resetar para nao quebrar dependencias:
  `<INVENTARIO_CREDENCIAIS>`.
- Toda revogacao e reset exigem aprovacao humana registrada.

## Registro

Cada reset/revogacao registra: conta, horario, aprovador, metodo e
evidencia (log do gestor de identidade). Ver checklist
`checklists/checklist-identidade.md` e playbook
`playbooks/PB-02-reset-credenciais-mfa.md`.
