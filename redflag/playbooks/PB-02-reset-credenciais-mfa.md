# PB-02 - Reset de credenciais e MFA

Camada: Acesso. RedFlags associadas: RF-ACC-01, RF-ACC-02, RF-ACC-03, RF-RED-02.

## Quando acionar

- Credencial administrativa ou de servico sem reset apos o incidente (RF-ACC-01).
- Sessao suspeita ou indicio de session hijacking (RF-ACC-02).
- Superusuario fora do minimo necessario (RF-ACC-03).
- Token de API ativo desde antes do incidente (RF-RED-02).

## Pre-requisitos

- Aprovacao de `<RESPONSAVEL_APROVADOR>`.
- Inventario de credenciais e dependencias: `<INVENTARIO_CREDENCIAIS>`.
- Acesso ao gestor de identidade: `<FERRAMENTA_IDENTIDADE>`.

## Passos de contencao

1. Registrar horario, contas afetadas e aprovador.
2. Resetar credenciais na ordem: contas de servico, administradores,
   usuarios finais.
3. Revogar tokens e chaves de API emitidos antes de
   `<DATA_PRIMEIRO_INDICIO>`.
4. Invalidar sessoes ativas: `scripts/reset_sessoes.sh` (iniciar em
   `DRY_RUN=1`).
5. Exigir reautenticacao com MFA para contas privilegiadas.
6. Reduzir privilegios excessivos ao minimo necessario.

## Preservacao de evidencias

- Exportar logs de autenticacao e de uso de credenciais antes do reset.
- Registrar IDs de sessao, IPs de origem e user agents suspeitos.

## Validacao

- Nenhuma sessao ativa anterior ao reset.
- Nenhum token pre-incidente valido.
- Autenticacoes pos-reset somente com MFA para contas privilegiadas.

## Criterios de rollback

- Credencial de servico quebrada por dependencia nao mapeada: reemitir com
  novo segredo e registrar; nao reativar a credencial antiga.

## Responsaveis

- Execucao: `<RESPONSAVEL_ACESSO>`.
- Aprovacao: `<RESPONSAVEL_APROVADOR>`.

## Registro obrigatorio

Conta, horario, aprovador, metodo de reset e evidencia (log do gestor de
identidade) em `<REGISTRO_INCIDENTE>`.
