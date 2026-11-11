# PB-03 - Restauracao de backup air-gapped

Camada: Dados. RedFlag associada: RF-DAT-01.

## Quando acionar

- Backup sem validacao de integridade ou sem copia air-gapped (RF-DAT-01).
- Necessidade de restaurar dados apos contencao confirmada.

## Pre-requisitos

- Contencao em andamento ou concluida (PB-01, PB-02).
- Identificacao do ponto de recuperacao anterior a
  `<DATA_PRIMEIRO_INDICIO>`.
- Acesso a copia air-gapped: `<LOCALIZACAO_COPIA>`.
- Aprovacao de `<RESPONSAVEL_APROVADOR>` para restaurar.

## Passos de contencao e recuperacao

1. Suspender uso do backup afetado enquanto nao validado.
2. Validar integridade da copia air-gapped contra o manifesto de hash.
3. Restaurar em ambiente isolado antes de produzir em ambiente produtivo.
4. Verificar hashes de todos os artefatos reimplantados (PB-04).
5. Aplicar correcoes pendentes e varredura de vulnerabilidades antes de
   reconectar (RF-MON-03).

## Preservacao de evidencias

- Preservar o estado atual dos dados comprometidos (copia de quarentena)
  antes de sobrescrever.
- Registrar hashes dos dados restaurados.

## Validacao

- `sha256sum -c` do manifesto da copia air-gapped sem divergencias.
- Dados restaurados conferidos com amostra funcional: `<CRITERIO_AMOSTRA>`.
- Nenhum binario com hash divergente no ambiente restaurado.

## Criterios de rollback

- Divergencia de hash ou indício de comprometimento na copia restaurada:
  interromper restauracao, preservar copia e acionar PB-04 e PB-06.

## Responsaveis

- Execucao: `<RESPONSAVEL_DADOS>`.
- Aprovacao: `<RESPONSAVEL_APROVADOR>`.

## Registro obrigatorio

Copia usada, ponto de recuperacao, resultado da validacao de hash e
aprovador em `<REGISTRO_INCIDENTE>`.
