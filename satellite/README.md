# SICX Satellite Tracking System

Sistema de rastreamento satelital maritimo em tempo real integrado ao SICX.

## Visao Geral

Monitora em tempo real todas as embarcacoes comerciais operando nas rotas maritimas entre os 27 portos internacionais parceiros. Utiliza processamento de imagens de satellite, AIS (Automatic Identification System) e contratos inteligentes para rastreabilidade ponta a ponta de cargas internacionais.

## Estrutura

```
satellite/
├── frontend/                    # Interface do usuario
│   ├── css/                    # Estilos
│   ├── js/                     # Scripts
│   ├── assets/                 # Recursos estaticos
│   └── index.html              # Pagina principal
├── backend/                    # Servidor e logica
│   ├── server/                 # Configuracao do servidor
│   ├── services/               # Servicos (AIS, Sentinel, RedFlag)
│   ├── models/                 # Modelos de dados
│   ├── routes/                 # Rotas API
│   └── config/                 # Configuracoes
├── data/                       # Dados estaticos
│   ├── ports/                  # Informacoes dos portos
│   ├── vessels/                # Dados das embarcacoes
│   └── routes/                 # Rotas maritimas
└── docs/                       # Documentacao
```

## Funcionalidades

1. **Mapa Interativo Global**
   - Visualizacao em tempo real de todas as embarcacoes ativas
   - Rotas maritimas animadas entre portos
   - Zoom dinamico com detalhes de cada navio
   - Camadas: rotas, portos, zonas economicas, alertas

2. **Rastreamento via Satellite**
   - Processamento de imagens Sentinel-2 e Landsat
   - Integracao com AIS
   - Atualizacao de posicao a cada 30 segundos
   - Detecao de desvios de rota com RedFlag automatico

3. **Monitoramento de Cargas**
   - Cada embarcacao vinculada a contratos B2B/B2G internacionais
   - Hash unico de rastreabilidade por conteiner
   - CBS/IBS calculados automaticamente na origem
   - Previsao de chegada com base em condicoes meteorologicas

4. **Painel de Controle**
   - Lista de embarcacoes com filtros (status, carga, pais)
   - Detalhes completos ao clicar em cada navio
   - Alertas de atraso, desvio ou contencao
   - Integracao com motor RedFlag para anomalias

5. **Integracao com Portos**
   - 27 portos conectados (Brasil, Mercosul, BRICS, CPLP)
   - Status de atracamento em tempo real
   - Tempo estimado de desembarque
   - Sincronizacao com alfandegas

6. **Seguranca e Conformidade**
   - RedFlag para desvios > 50nm da rota planejada
   - Alertas de parada nao autorizada
   - Verificacao de bandeira e documentacao
   - Auditoria completa com carimbo ICP-Brasil

## Tecnologias

- **Frontend**: Leaflet.js, HTML5 Canvas, Vanilla JavaScript
- **Backend**: Node.js, Express, WebSocket
- **Dados Satelitais**: API Sentinel Hub, AIS receivers
- **Seguranca**: mTLS, Motor RedFlag
- **Atualizacao**: 30 segundos por embarcacao

## Inicializacao

```bash
# Instalar dependencias
cd satellite/backend
npm install

# Iniciar servidor
node server/index.js

# Acessar interface
http://localhost:3000
```

## Configuracao

Ver `satellite/backend/config/default.json` para configuracoes de API keys e endpoints.
