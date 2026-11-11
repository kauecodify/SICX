# PB-06 - EDR e threat hunting

Camada: Monitoramento. RedFlag associada: RF-MON-01.

## Quando acionar

- Execucao suspeita de PowerShell ou comportamento anomalo no EDR (RF-MON-01).
- Hunt proativo pos-contencao (ver `docs/05-monitoramento-e-threat-hunting.md`).

## Pre-requisitos

- Acesso ao console do EDR: `<FERRAMENTA_EDR>`.
- Linha de base de execucao conhecida: `<LINHA_DE_BASE>`.

## Passos

1. No alerta de execucao suspeita, isolar o endpoint no modo contencao do
   EDR (sem desligar).
2. Coletar telemetria: linha de comando, processo pai, hash do binario,
   arquivos tocados, conexoes de rede.
3. Calcular hash do binario envolvido e seguir PB-04 em caso de divergencia.
4. Buscar o mesmo padrao (linha de comando, hash, familia de processo) em
   todos os endpoints.
5. Registrar achados como eventos JSONL e reavaliar com o motor RedFlag.

## Preservacao de evidencias

- Exportar telemetria do EDR antes de qualquer limpeza.
- Manter o endpoint isolado ate liberacao formal.

## Validacao

- Nenhum endpoint com o padrao suspeito ativo apos contencao.
- Buscas repetidas sem novos alertas de RF-MON-01 em janela acordada.

## Criterios de rollback

- Falso positivo (atividade administrativa legitima): remover isolamento
  com aprovacao e registrar o padrao na linha de base.

## Responsaveis

- Execucao: `<RESPONSAVEL_MONITORAMENTO>`.
- Aprovacao: `<RESPONSAVEL_COMANDO>`.

## Registro obrigatorio

Endpoint, padrao detectado, acoes do EDR, achados de busca e aprovador em
`<REGISTRO_INCIDENTE>`.
