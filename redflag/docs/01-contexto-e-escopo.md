# 01 - Contexto e escopo

## Contexto

Apos ataque hacker ao SICX (Sistema de Controle e Informacoes), a prioridade
e conter o dano, preservar evidencias e restaurar a integridade dos dados.
Este repositorio operacional (RedFlag) apoia a mitigacao imediata com
sinalizacao de risco, playbooks, checklists e registro auditavel.

## Objetivos

- Impedir movimento lateral entre servidores.
- Impedir exfiltracao de dados (controle de egress).
- Eliminar reutilizacao de credenciais comprometidas.
- Preservar evidencias com cadeia de custodia.
- Restaurar dados a partir de backup integro e air-gapped.

## Escopo

Incluido:

- Sinalizacao de risco imediato (RedFlags) nas camadas Rede, Acesso, Dados
  e Monitoramento.
- Playbooks de contencao, preservacao e restauracao.
- Motor de avaliacao de eventos com registro append-only.
- Painel de acompanhamento e consultas de exemplo.

Nao incluido:

- Analise forense completa e atribuicao de autoria.
- Comunicacao externa, juridica e de PR (tratada fora deste repositorio).
- Remediacao estrutural de longo prazo (pos-incidente).

## Premissas

- Nenhuma acao destrutiva e automatica. Acoes que afetem disponibilidade
  exigem aprovacao humana registrada.
- Toda avaliacao e alerta sao registrados em log append-only.
- Responsaveis, contatos e ferramentas especificas sao placeholders
  (`<RESPONSAVEL>`, `<FERRAMENTA>`) ate preenchidos pela organizacao.
