# Checklist de dados

Camada: Dados. Playbooks: PB-03, PB-04, PB-05. RedFlags: RF-DAT-01, RF-DAT-02, RF-DAT-03.

## Backups (RF-DAT-01)

- [ ] Backups inventariados com localizacao das copias
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`
- [ ] Copia air-gapped identificada
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<LOCALIZACAO_COPIA>`
- [ ] Integridade validada contra manifesto de hash
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<RESULTADO_SHA256SUM>`

## Binarios e bibliotecas (RF-DAT-02)

- [ ] Hashes calculados e comparados com fonte confiavel
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<FONTE_HASH_REFERENCIA>`
- [ ] Artefatos divergentes em quarentena (sem delecao)
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<CAMINHO_QUARENTENA>`

## Logs (RF-DAT-03)

- [ ] Estado do servidor de logs preservado com snapshot e hash
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<HASH_SNAPSHOT>`
- [ ] Lacunas de log documentadas e fontes alternativas consultadas
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`

## Restauracao

- [ ] Ponto de recuperacao anterior a `<DATA_PRIMEIRO_INDICIO>` definido
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`
- [ ] Restauracao executada em ambiente isolado antes de produtivo
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<EVIDENCIA>`
- [ ] Aprovacao registrada
  - Aprovador: `<RESPONSAVEL_APROVADOR>` | Data/hora: `<DATA_HORA>`

## Validacao

- [ ] Hashes conferidos apos cada transferencia de evidencia
  - Responsavel: `<RESPONSAVEL>` | Data/hora: `<DATA_HORA>` | Evidencia: `<MANIFESTO_SHA256>`
