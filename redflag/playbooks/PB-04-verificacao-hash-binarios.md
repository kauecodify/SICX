# PB-04 - Verificacao de hash de binarios

Camada: Dados. RedFlag associada: RF-DAT-02.

## Quando acionar

- Hash de binario ou biblioteca divergente do original (RF-DAT-02).
- Antes de reimplantar artefatos apos restauracao (PB-03).

## Pre-requisitos

- Fonte confiavel de hashes de referencia: `<FONTE_HASH_REFERENCIA>`.
- Acesso de leitura aos artefatos suspeitos.
- Espaco para copias de quarentena.

## Passos

1. Calcular o hash (SHA-256) do artefato suspeito e registrar.
2. Comparar com o hash de referencia da fonte confiavel.
3. Em caso de divergencia: copiar o artefato para quarentena
   (`<CAMINHO_QUARENTENA>`), sem apagar do local original.
4. Substituir o artefato por copia verificada da fonte confiavel.
5. Repetir para todas as dependencias do servico afetado.

## Preservacao de evidencias

- Manter copia bit a bit do artefato divergente com hash registrado.
- Registrar caminho, data de alteracao e proprietario original.

## Validacao

- Todos os artefatos em producao com hash igual ao de referencia.
- Nenhuma copia divergente fora da quarentena.

## Criterios de rollback

- Falso positivo (referencia desatualizada): atualizar a base de
  referencia e registrar; documentar a versao correta.

## Responsaveis

- Execucao: `<RESPONSAVEL_DADOS>`.
- Aprovacao: `<RESPONSAVEL_COMANDO>`.

## Registro obrigatorio

Caminho, hash calculado, hash de referencia, decisao e aprovador em
`<REGISTRO_INCIDENTE>`.
