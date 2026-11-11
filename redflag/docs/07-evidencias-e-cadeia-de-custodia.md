# 07 - Evidencias e cadeia de custodia

## Principios

- Coletar antes de conter de forma invasiva; nunca reinicializar antes da coleta.
- Trabalhar sempre sobre copias; a evidencia original nunca e editada.
- Todo registro e append-only.

## Coleta

1. Executar `scripts/coletar_evidencias.sh "<HOSTNAME>"` no host alvo.
   O script coleta logs, processos, conexoes, roteamento e cron, e gera
   `MANIFESTO.sha256` com o hash de cada arquivo coletado.
2. Em Windows, usar ferramentas de coleta aprovadas pela organizacao:
   `<FERRAMENTA_COLETA>`.

## Hash

- Calcular SHA-256 de cada evidencia na coleta e conferir apos cada
  transferencia: `sha256sum -c MANIFESTO.sha256`.
- Registrar o hash no registro de incidente na coleta e a cada transferencia.

## Armazenamento

- Copiar para midia de armazenamento controlada: `<MIDIA_ARMAZENAMENTO>`.
- Restringir leitura ao time de resposta: `<GRUPO_ACESSO_EVIDENCIAS>`.
- Manter ao menos duas copias em locais distintos.

## Registro de custodia

Para cada evidencia, registrar em `<REGISTRO_INCIDENTE>`:

| Campo | Conteudo |
| --- | --- |
| ID da evidencia | `<EVIDENCIA_ID>` |
| Data/hora da coleta (UTC) | `<DATA_HORA>` |
| Origem (host, caminho) | `<HOSTNAME>` / `<CAMINHO>` |
| Coletado por | `<RESPONSAVEL_EVIDENCIAS>` |
| SHA-256 | `<HASH>` |
| Transferencias | De/para, horario, responsavel |
| Observacoes | Estado, limitacoes |

## Descarte

Evidencias so sao descartadas com liberacao formal da organizacao:
`<CRITERIO_DESCARTE>`. Enquanto o incidente estiver aberto, nada e descartado.
