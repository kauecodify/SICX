# 04 - Dados e recuperacao

## Objetivo

Garantir que a restauracao use apenas dados integros e que nenhuma
alteracao maliciosa seja preservada.

## Prioridades

1. Validar integridade de backups antes de qualquer restauracao (RF-DAT-01).
2. Identificar binarios e bibliotecas alterados (RF-DAT-02) e coloca-los em
   quarentena, sem remocao automatica.
3. Preservar logs e investigar lacunas (RF-DAT-03).

## Diretrizes de recuperacao

- Restaurar somente de copia air-gapped com manifesto de hash validado
  (playbook PB-03).
- Preferir reconstruir a partir de fonte confiavel a restaurar dados de
  origem duvidosa.
- Comparar hashes de binarios com o original confiavel antes de reimplantar
  (playbook PB-04).
- Nao apagar nada do host comprometido: quarentena e copia, nunca delecao.
- Definir ponto de recuperacao anterior ao primeiro indicio de
  comprometimento: `<DATA_PRIMEIRO_INDICIO>`.

## Validacao pos-restauracao

- Verificacao de hash de todos os artefatos reimplantados.
- Varredura de vulnerabilidades antes de reconectar (RF-MON-03).
- Monitoracao reforçada nas primeiras 72 horas.

Ver checklist `checklists/checklist-dados.md`.
