# PB-07 - Honeypots e varredura

Camada: Monitoramento. RedFlags associadas: RF-MON-02, RF-MON-03.

## Quando acionar

- Acesso a honeypot interno ou arquivo isca (RF-MON-02).
- Vulnerabilidade critica exploravel identificada em varredura (RF-MON-03).

## Pre-requisitos

- Honeypots e arquivos isca em operacao: `<CONFIG_HONEYPOT>`.
- Varredor de vulnerabilidades configurado: `<FERRAMENTA_VARREDURA>`.

## Passos

### Acesso a honeypot (RF-MON-02)

1. Tratar o host de origem como comprometido.
2. Isolar o host (PB-01) e coletar evidencias.
3. Acionar threat hunting conforme PB-06.
4. Identificar como o acesso ocorreu (credencial, exploit, mapeamento).

### Vulnerabilidade critica (RF-MON-03)

1. Confirmar a exposicao do host afetado.
2. Priorizar correcao ou controle compensatorio (virtual patch, ACL).
3. Reescanear para confirmar a correcao.
4. Registrar na fila de tratativa com prazo.

## Preservacao de evidencias

- Exportar logs do honeypot e da varredura com hash.
- Registrar sequencia de acessos ao arquivo isca.

## Validacao

- Nenhum acesso novo a honeypots apos contencao.
- Nenhuma vulnerabilidade critica exploravel aberta no reescaneamento.

## Criterios de rollback

- Falso positivo de honeypot (acesso administrativo legitimo): registrar
  o padrao e ajustar regras; manter o honeypot ativo.

## Responsaveis

- Execucao: `<RESPONSAVEL_MONITORAMENTO>`.
- Aprovacao: `<RESPONSAVEL_COMANDO>`.

## Registro obrigatorio

Origem do acesso, achados de varredura, correcoes e aprovador em
`<REGISTRO_INCIDENTE>`.
