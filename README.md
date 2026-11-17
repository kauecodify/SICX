# SICX - Sistema Integrado da Cadeia Nacional

Sistema soberano brasileiro que unifica operacoes B2B, B2C e B2G com integracao internacional, tributacao CBS/IBS, seguranca RedFlag e rastreabilidade ponta a ponta via blockchain nacional.

## Visao Geral

O SICX e uma plataforma completa que conecta toda a cadeia nacional, desde a materia-prima ate o cidadao, com integracao internacional atraves de 27 portos estrategicos, rastreamento satelital de embarcacoes e monitoramento em tempo real de cargas.

## Estrutura do Repositorio

```
SICX/
├── index.html                    # Interface principal do SICX
├── README.md                     # Documentacao principal
├── LICENSE                       # Licenca do projeto
└── satellite/                    # Sistema de Rastreamento Satelital
    ├── README.md                 # Documentacao do modulo satelital
    ├── frontend/                 # Interface do usuario
    │   ├── index.html            # Pagina principal do rastreamento
    │   ├── css/                  # Estilos
    │   ├── js/                   # Scripts (Mapa, Vessels, Ports, Alerts, Dashboard)
    │   └── assets/               # Recursos estaticos
    ├── backend/                  # Servidor e logica
    │   ├── server/               # Configuracao do servidor
    │   ├── services/             # Servicos (AIS, Sentinel, RedFlag, etc.)
    │   ├── models/               # Modelos de dados
    │   ├── routes/               # Rotas API
    │   ├── config/               # Configuracoes
    │   └── package.json          # Dependencias Node.js
    ├── data/                     # Dados estaticos
    │   ├── ports/                # Portos
    │   ├── vessels/              # Embarcacoes
    │   └── routes/               # Rotas maritimas
    ├── docs/                     # Documentacao
    │   ├── ARCHITECTURE.md       # Arquitetura do sistema
    │   └── API.md                # Documentacao da API
    ├── docker-compose.yml        # Configuracao Docker
    └── .gitignore                # Arquivos ignorados
└── redflag/                      # Sistema RedFlag existente
    ├── README.md                 # Documentacao RedFlag
    ├── index.html                # Painel RedFlag
    └── ...
```

## Modulos Principais

### 1. Sistema de Rastreamento Satelital (`/satellite`)

Sistema de rastreamento satelital maritimo em tempo real que monitora todas as embarcacoes comerciais operando nas rotas entre os 27 portos internacionais parceiros.

**Funcionalidades:**
- Mapa interativo global com Leaflet.js
- Rastreamento via satellite (Sentinel-2, Landsat)
- Integracao com AIS (Automatic Identification System)
- Monitoramento de cargas com contratos inteligentes
- Painel de controle com alertas RedFlag
- Integracao com portos e alfandegas

**Tecnologias:**
- Frontend: HTML5, CSS3, Vanilla JavaScript, Leaflet.js, Chart.js
- Backend: Node.js, Express, WebSocket
- Dados: API Sentinel Hub, AIS receivers
- Seguranca: mTLS, Motor RedFlag

### 2. Sistema RedFlag (`/redflag`)

Sistema de sinalizacao de risco imediato para conter danos, preservar evidencias e restaurar integridade dos dados.

**Funcionalidades:**
- Motor de avaliacao de alertas
- Playbooks de contencao (PB-01 a PB-07)
- Auditoria com carimbo ICP-Brasil
- Monitoramento EDR, firewall, identidade
- Nenhuma acao destrutiva automatica

## Portos Internacionais Integrados

### Brasil (10 portos)
- Santos (SP)
- Paranagua (PR)
- Rio Grande (RS)
- Suape (PE)
- Itaqui (MA)
- Vitoria (ES)
- Salvador (BA)
- Manaus (AM)
- Belem (PA)
- Rio de Janeiro (RJ)

### Mercosul (4 portos)
- Buenos Aires (AR)
- Montevideo (UY)
- Asuncion (PY)
- Iquique (BO)

### BRICS (8 portos)
- Xangai (CN)
- Mumbai (IN)
- Durban (ZA)
- Alexandria (EG)
- Djibouti (ET)
- Bandar Abbas (IR)
- Jebel Ali (AE)
- Sao Petersburgo (RU)

### CPLP (5 portos)
- Lisboa (PT)
- Luanda (AO)
- Maputo (MZ)
- Mindelo (CV)
- Dili (TL)

## Tributacao (Reforma Tributaria)

| Tributo | Aliquota | Competencia |
|---------|----------|-------------|
| CBS | 12% | Federal |
| IBS | 17% | Estados/Municipios |
| Imp. Importacao Mercosul | 0% | Federal |
| Imp. Importacao BRICS/CPLP | 10% | Federal |
| Imp. Importacao Demais | 20% | Federal |

## Inicializacao

### Desenvolvimento

```bash
# Navegar para o modulo satelital
cd satellite

# Instalar dependencias do backend
cd backend
npm install

# Iniciar servidor backend
node server/index.js

# Em outro terminal, servir frontend
cd ../frontend
python3 -m http.server 8000

# Acessar interface
http://localhost:8000
```

### Producao com Docker

```bash
# Navegar para o modulo satelital
cd satellite

# Criar arquivos de configuracao
mkdir -p config data certs
cp backend/config/default.json backend/config/production.json

# Editar configuracoes (API keys, etc.)
nano backend/config/production.json

# Iniciar com Docker Compose
docker-compose up -d

# Acessar interface
http://localhost
```

### Producao sem Docker

```bash
# Instalar dependencias
cd satellite/backend
npm install

# Configurar variaveis de ambiente
export NODE_ENV=production
export PORT=3000
export WS_PORT=3001

# Iniciar servidor
npm start

# Servir frontend (usando nginx ou similar)
# Configurar proxy reverso para /api -> localhost:3000
```

## Configuracao

### Backend

Editar `satellite/backend/config/production.json`:

```json
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0",
    "websocketPort": 3001
  },
  "sentinelHub": {
    "apiUrl": "https://services.sentinel-hub.com/api/v1",
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET"
  },
  "ais": {
    "apiUrl": "https://data.marinetraffic.com/api",
    "apiKey": "YOUR_AIS_API_KEY",
    "updateInterval": 30000
  },
  "redFlag": {
    "thresholdDistance": 50,
    "thresholdStopTime": 3600000,
    "autoApprove": false
  }
}
```

### mTLS

Colocar certificados em `satellite/certs/`:
- `server.crt` - Certificado do servidor
- `server.key` - Chave privada
- `ca.crt` - Certificado da CA

## API

Ver documentacao completa em `satellite/docs/API.md`

### Endpoints Principais

- `GET /api/vessels` - Listar embarcacoes
- `GET /api/vessels/:id` - Detalhes da embarcacao
- `GET /api/ports` - Listar portos
- `GET /api/ports/:id` - Detalhes do porto
- `GET /api/alerts` - Listar alertas
- `GET /api/statistics` - Estatisticas do sistema
- `POST /api/calculate-tax` - Calcular impostos
- `GET /health` - Health check

### WebSocket

Conectar em `ws://localhost:3001` para atualizacoes em tempo real.

## RedFlag Engine

O motor RedFlag monitora automaticamente:

1. **Desvio de Rota**: Embarcacoes que se afastam mais de 50 milhas nauticas da rota planejada
2. **Parada Nao Autorizada**: Embarcacoes paradas por mais de 1 hora sem autorizacao
3. **Problemas de Documentacao**: Falta de IMO, MMSI ou bandeira
4. **Carga de Alto Valor**: Cargas acima de R$ 1M ou 10.000 unidades
5. **Alertas Alfandegarios**: Problemas com documentacao aduaneira
6. **Divergencias Tributarias**: Inconsistencias no calculo de impostos
7. **Problemas com Conteineres**: Issues com rastreamento de conteineres

Cada alerta recebe:
- Código RedFlag unico
- Nivel de severidade (BAIXA, MEDIA, ALTA, CRITICA)
- Playbook de contencao (PB-01 a PB-07)
- Responsavel
- SLA (Service Level Agreement)
- Carimbo ICP-Brasil para auditoria

## Contribuindo

1. Faca fork do repositorio
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudancas (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licenca

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato

Para duvidas ou suporte:
- Email: sicx-support@government.br
- Telefone: +55 0800 123 4567
- Horario: 24/7

## Roadmap

- [x] Sistema de rastreamento satelital basico
- [x] Integracao com AIS
- [x] Mapa interativo com Leaflet.js
- [x] Painel de controle com alertas
- [x] Motor RedFlag para anomalias
- [ ] Integracao com Sentinel Hub (producao)
- [ ] Blockchain nacional para rastreabilidade
- [ ] Integracao completa com alfandegas
- [ ] Mobile app para monitoramento
- [ ] IA para predicao de rotas e atrasos
