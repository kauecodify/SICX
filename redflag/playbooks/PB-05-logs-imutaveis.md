# PB-05 - Logs imutaveis

Camada: Dados. RedFlag associada: RF-DAT-03.

## Quando acionar

- Log apagado, alterado ou ausente em servidor de logs imutavel (RF-DAT-03).

## Pre-requisitos

- Acesso de leitura ao servidor de logs: `<SERVIDOR_LOGS>`.
- Aprovacao de `<RESPONSAVEL_COMANDO>` para qualquer mudanca de configuracao.

## Passos

1. Nao reiniciar nem reconfigurar o servidor de logs antes do snapshot.
2. Capturar snapshot do estado atual (disco, configuracao, servicos).
3. Calcular hash do snapshot e registrar na cadeia de custodia.
4. Identificar a lacuna: periodo, hosts e fontes afetados.
5. Reconstituir o que for possivel a partir de fontes alternativas
   (firewall, EDR, gateway de API).
6. Apos a coleta, corrigir a causa da lacuna (falha de agente, espaco,
   alteracao maliciosa) e reativar o WORM/append-only.

## Preservacao de evidencias

- Snapshot com hash registrado em `<REGISTRO_INCIDENTE>`.
- Logs de acesso ao servidor de logs (quem acessou e quando).

## Validacao

- Lacuna documentada com periodo e fontes alternativas consultadas.
- Ingestao de logs reativada e conferida em tempo real.

## Criterios de rollback

- Correcao de configuracao que cause novo problema de ingestao: reverter
  para o snapshot de configuracao registrado, com aprovacao.

## Responsaveis

- Execucao: `<RESPONSAVEL_DADOS>` com apoio de `<RESPONSAVEL_EVIDENCIAS>`.
- Aprovacao: `<RESPONSAVEL_COMANDO>`.

## Registro obrigatorio

Periodo da lacuna, snapshot, hashes, fontes alternativas e aprovador em
`<REGISTRO_INCIDENTE>`.
