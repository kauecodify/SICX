# SICX RedFlag - Sistema de sinalizacao de risco imediato

Sistema de apoio a mitigacao imediata apos incidente de seguranca no SICX
(Sistema de Controle e Informacoes). Objetivo: conter o dano, preservar
evidencias e restaurar a integridade dos dados, priorizando as camadas
Rede, Acesso, Dados e Monitoramento.

## Como funciona

1. Fontes de monitoramento (EDR, firewall, gestor de identidade, varredores)
   produzem eventos em JSONL.
2. O motor `scripts/avaliar_redflags.py` aplica as regras de
   `redflags/redflags.yaml` sobre os eventos.
3. Cada correspondencia gera um alerta JSON registrado em
   `alerts.jsonl` (append-only, nunca truncado).
4. O alerta indica severidade, acao recomendada, playbook, responsavel, SLA
   e se exige aprovacao humana.
5. O operador executa o playbook indicado. Nenhuma acao destrutiva e
   executada automaticamente pelo sistema.

## Estrutura

    redflag/
    |- README.md
    |- index.html                  Painel com estilizacao vermelha (uso interno)
    |- docs/                       Contexto, runbooks, matriz, evidencias, RACI
    |- redflags/                   Regras YAML, schema JSON, eventos de exemplo
    |- playbooks/                  PB-01 a PB-07 (contencao a restauracao)
    |- checklists/                 Checklists praticos por camada
    |- scripts/                    Motor de avaliacao e scripts de apoio
    |- dashboard/                  Descricao do painel e consultas KQL
    `- tests/                      Testes unitarios e casos de teste

## Controle de acesso

O uso e restrito a operadores internos. Usuarios externos nao conseguem
utilizar a aplicacao, mesmo conhecendo o funcionamento:

- O motor de avaliacao exige um token de operador validado por SHA-256
  contra `redflag/.acesso/operador.sha256`. Sem o arquivo provisionado
  pela equipe interna, o motor recusa qualquer execucao.
- O painel `index.html` permanece bloqueado enquanto o hash da chave do
  operador nao for provisionado em `CONFIG.hashOperador`.
- O painel e o motor devem ser servidos e executados apenas em rede
  interna, sob controle de identidade da organizacao. Nenhuma credencial
  real e incluida neste repositorio: use placeholders.

Provisionamento do acesso (equipe interna):

    mkdir -p redflag/.acesso
    printf '%s' "<TOKEN_OPERADOR_INTERNO>" | sha256sum | awk '{print $1}' > redflag/.acesso/operador.sha256

Os arquivos `redflag/.acesso/`, `redflag/alerts.jsonl` e `redflag/logs/`
sao locais e nao versionados (ver `redflag/.gitignore`).

## Como usar

    cd redflag
    pip install pyyaml
    export REDFLAG_OPERATOR_TOKEN="<TOKEN_OPERADOR_INTERNO>"
    python3 scripts/avaliar_redflags.py redflags/exemplos-eventos.jsonl

Saidas:

- Codigo 0: nenhuma RedFlag critica.
- Codigo 1: acesso negado ou erro de entrada.
- Codigo 2: ao menos uma RedFlag critica disparada.

Para usar eventos reais, informe o arquivo JSONL da sua fonte:

    python3 scripts/avaliar_redflags.py <CAMINHO_EVENTOS.jsonl> --saida <CAMINHO_ALERTAS.jsonl>

## Como validar as regras

1. Sintaxe do YAML e dos campos obrigatorios: o proprio motor valida ao
   carregar (`carregar_regras`).
2. Estrutura contra o schema: valide `redflags/redflags.yaml` com
   `redflags/schema.json` usando qualquer validador JSON Schema.
3. Regras devem referenciar playbooks existentes em `playbooks/`.

## Como executar os testes

    cd redflag
    python3 -m unittest discover -s tests -v

Sao 11 testes: controle de acesso (token ausente, invalido e hash ausente),
codigo de saida para regra critica, alertas coerentes, append-only e os
casos declarativos de `tests/casos_teste.yaml` cobrindo as 12 regras.

## Como interpretar alertas

Cada linha de `alerts.jsonl` contem:

| Campo | Significado |
| --- | --- |
| `timestamp` | Momento da avaliacao (UTC) |
| `severidade` | critica, alta, media ou baixa |
| `redflag` | Identificador da regra (ex.: RF-RED-01) |
| `acao_recomendada` | Primeira acao esperada, sempre com aprovacao humana |
| `playbook` | Playbook a seguir |
| `sla` | Prazo maximo de tratativa |
| `requer_aprovacao_humana` | Sempre verdadeiro neste sistema |
| `evento_origem` | Evento que disparou a regra |

Consulte `docs/06-matriz-redflags.md` para a visao consolidada e
`dashboard/painel-redflags.md` para o acompanhamento.

## Principios

- Registro append-only: alertas e logs de execucao nunca sao truncados.
- Nenhuma acao destrutiva automatica: contencao afetando disponibilidade
  exige aprovacao humana registrada.
- Preservacao de evidencias antes de qualquer reinicializacao ou limpeza.
