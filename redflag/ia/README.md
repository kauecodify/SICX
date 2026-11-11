# IA - Operacao de seguranca em tempo real, sempre ativa

Backend de inteligencia artificial que varre as portas do SICX
continuamente, aprende a linha de base de trafego e, em qualquer caso de
anormalidade, identifica o invasor suspeito e gera evidencias para o
sistema RedFlag.

## Operacao

O backend roda em loop continuo (sempre ativo) com dois estados:

1. Aprendizado: nos primeiros ciclos, o modelo de IA estatistica registra
   quais IPs se conectam, a que portas e com que frequencia. Nada e
   classificado nesse periodo.
2. Vigilia: a cada ciclo (padrao: 5 segundos), o backend coleta as
   conexoes ativas do sistema e pontua cada origem. Score igual ou
   superior ao limiar (padrao: 70) classifica a origem como
   `invasor_suspeito`.

Cobertura: TODAS as portas locais, incluindo a porta afetada no incidente
de santow (configuravel em `config.yaml`, chave `incidentes.santow.porta`).
A porta de incidente conhecido recebe peso adicional no score. Enquanto a
porta real de santow nao for preenchida (placeholder
`<PORTA_INCIDENTE_SANTOW>`), o monitoramento segue ativo em todas as
portas e o backend emite aviso.

## Modelo de IA

Modelo estatistico de deteccao de anomalias, sem dependencias externas
(biblioteca padrao do Python). Fatores pontuados por origem:

| Fator | Peso | Sinal |
| --- | --- | --- |
| IP de origem nunca visto na linha de base | 25 | Novidade |
| Taxa de conexoes acima da media + 3 desvios | 30 | Surto |
| 5 ou mais portas remotas distintas (varredura) | 30 | Reconhecimento |
| Porta local fora dos servicos internos conhecidos | 15 | Exposicao |
| Porta de incidente conhecido (ex.: santow) | 10 | Prioridade |

Score maximo 100; confianca reportada junto ao achado. O modelo e
deterministico e auditavel: cada invasor identificado carrega os fatores
que produziram a pontuacao.

## Descoberta do invasor

Em qualquer anormalidade acima do limiar, o backend registra em
`ia/invasores.jsonl` (append-only):

- IP de origem, portas locais e remotas tocadas, numero de conexoes.
- Score, confianca e fatores que dispararam a classificacao.
- Timestamp e status `investigacao`.

O perfil do invasor nao executa nenhuma acao contra a origem: contencao
segue os playbooks (PB-01, PB-02) com aprovacao humana.

## Integracao com o RedFlag

Com a flag `--motor`, cada achado gera evento normalizado em
`ia/eventos_ia.jsonl` e aciona `scripts/avaliar_redflags.py`, que aplica a
regra RF-IA-01 (varredura ou acesso anomalo a porta detectado por IA) e
registra o alerta em `alertas_ia.jsonl` com playbook e SLA.

## Controle de acesso

Uso restrito a operadores internos: o backend exige token validado por
SHA-256 contra `redflag/.acesso/operador.sha256`, no mesmo mecanismo do
motor. Usuarios externos nao conseguem executar, mesmo conhecendo o
funcionamento.

## Como rodar

    cd redflag/ia
    export REDFLAG_OPERATOR_TOKEN="<TOKEN_OPERADOR_INTERNO>"
    python3 backend.py                 # sempre ativo, tempo real
    python3 backend.py --uma-vez       # diagnostico de um ciclo
    python3 backend.py --motor         # tempo real com alertas RedFlag

Replay de evidencias para analise offline:

    python3 backend.py --entrada ciclos.jsonl --uma-vez

Formato do replay (um ciclo por linha):

    {"conexoes": [{"porta_local": 22, "ip_origem": "<IP>", "porta_remota": 51000, "estado": "ESTAB"}]}

## Testes

    cd redflag
    python3 -m unittest discover -s tests -v

## Limitacoes

- Modo sistema depende da ferramenta `ss` (iproute2) para leitura de
  conexoes; sem ela, o ciclo nao coleta e emite aviso.
- O modelo aprende por host. Ajuste `portas_servicos_internas` em
  `config.yaml` ao ambiente real para reduzir falso positivo do fator de
  exposicao.
- Nenhum dado real de rede e incluido neste repositorio: use placeholders.
