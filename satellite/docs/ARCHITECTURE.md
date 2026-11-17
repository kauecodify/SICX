# SICX Satellite Tracking - Architecture Documentation

## Overview

The SICX Satellite Tracking System is a real-time maritime satellite tracking system integrated with the SICX platform. It monitors all commercial vessels operating on maritime routes between 27 international partner ports using satellite imagery processing, AIS (Automatic Identification System), and smart contracts for end-to-end cargo traceability.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SICX Satellite Tracking System             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │      Frontend    │    │      Backend     │    │    Data      │ │
│  │                 │    │                  │    │  Sources    │ │
│  │  ┌─────────────┐ │    │  ┌─────────────┐ │    │             │ │
│  │  │   Map UI     │ │    │  │  WebSocket   │ │    │  ┌───────┐ │ │
│  │  │ (Leaflet.js) │ │    │  │   Server     │ │    │  │ AIS   │ │ │
│  │  └─────────────┘ │    │  └─────────────┘ │    │  └───────┘ │ │
│  │                 │    │                  │    │             │ │
│  │  ┌─────────────┐ │    │  ┌─────────────┐ │    │  ┌───────┐ │ │
│  │  │  Dashboard   │ │    │  │  REST API   │ │    │  │Sentinel│ │ │
│  │  │   (Charts)   │ │    │  │ (Express)   │ │    │  │  Hub   │ │ │
│  │  └─────────────┘ │    │  └─────────────┘ │    │  └───────┘ │ │
│  │                 │    │                  │    │             │ │
│  │  ┌─────────────┐ │    │  ┌─────────────┐ │    │  ┌───────┐ │ │
│  │  │   Tables     │ │    │  │  Services    │ │    │  │Ports  │ │ │
│  │  │   (Vessels,  │ │    │  │ (AIS, Sentinel│ │    │  │ DB    │ │ │
│  │  │   Ports,      │ │    │  │  RedFlag)    │ │    │  └───────┘ │ │
│  │  │   Alerts)    │ │    │  └─────────────┘ │    │             │ │
│  │  └─────────────┘ │    │                  │    │             │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Vanilla JavaScript (No framework overhead)
- **Mapping**: Leaflet.js 1.9.4
- **Charts**: Chart.js
- **Styling**: Custom CSS with CSS Variables
- **Responsive**: Mobile-first design

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Real-time**: WebSocket (ws library)
- **HTTP**: REST API
- **Data**: JSON-based

### Data Sources
- **AIS**: MarineTraffic API or similar AIS data provider
- **Satellite**: Sentinel Hub API (Sentinel-2, Landsat)
- **Ports**: Internal database with 27 partner ports
- **Vessels**: Real-time tracking data

### Security
- **Transport**: mTLS for all internal communications
- **Authentication**: Token-based for external APIs
- **Audit**: ICP-Brasil timestamped logs
- **RedFlag**: Automated anomaly detection engine

## Component Details

### 1. Frontend Components

#### Map Module (`/frontend/js/map.js`)
- Real-time vessel tracking on interactive map
- Multiple layer support (vessels, routes, ports, zones)
- Custom markers with status indicators
- Route visualization with waypoints
- Click handlers for detailed information

#### Dashboard Module (`/frontend/js/dashboard.js`)
- Statistics cards (total vessels, ports, alerts)
- Chart visualizations (port distribution, alert types)
- Recent activity feed
- Tax rate display

#### Vessels Module (`/frontend/js/vessels.js`)
- Vessel data table with sorting and filtering
- Search functionality
- Detailed vessel information
- Integration with map for visualization

#### Ports Module (`/frontend/js/ports.js`)
- Port data table with filtering
- Port details display
- Block classification (Brasil, Mercosul, BRICS, CPLP)
- Capacity and status information

#### Alerts Module (`/frontend/js/alerts.js`)
- Real-time alert monitoring
- Alert table with filtering
- Acknowledge and resolve functionality
- Severity and type classification

### 2. Backend Components

#### Server (`/backend/server/index.js`)
- Express.js HTTP server
- WebSocket server for real-time updates
- Health check endpoint
- Static file serving
- Request routing

#### Services

**Vessel Service** (`/backend/services/vesselService.js`)
- Vessel data management
- Position updates
- Route deviation detection
- Cargo and contract information
- Subscription system for real-time updates

**AIS Service** (`/backend/services/aisService.js`)
- AIS data fetching
- Vessel position updates
- Caching mechanism
- Error handling

**Sentinel Service** (`/backend/services/sentinelService.js`)
- Satellite imagery processing
- Vessel detection from satellite images
- Weather condition monitoring
- Historical imagery access

**RedFlag Service** (`/backend/services/redFlagService.js`)
- Anomaly detection engine
- Alert generation and management
- Playbook integration
- Audit trail with ICP-Brasil timestamps
- Approval workflow

**Port Service** (`/backend/services/portService.js`)
- Port data management
- Vessel tracking at ports
- Queue management
- Waiting time estimation

#### Models

**Vessel** (`/backend/models/Vessel.js`)
- Vessel identification (IMO, MMSI)
- Position data (latitude, longitude, speed, course)
- Route information
- Cargo details
- Contract and tax information
- Tracking hash

**Port** (`/backend/models/Port.js`)
- Port identification (UNLOCODE)
- Geographic data
- Facilities and capacity
- Block classification
- Real-time status

**Route** (`/backend/models/Route.js`)
- Waypoints and distance
- Duration and speed recommendations
- Restricted areas
- Tax rates

**Alert** (`/backend/models/Alert.js`)
- Alert identification
- Vessel reference
- Type and severity
- Status and resolution tracking
- Audit trail

#### Routes (`/backend/routes/index.js`)
- REST API endpoints for all entities
- CRUD operations
- Filtering and search
- Statistics endpoints
- Tax calculation

### 3. Data Structure

#### Vessels
```json
{
  "id": "VSL_MSC_OSLO",
  "name": "MSC Oslo",
  "imo": 9846523,
  "mmsi": 245896000,
  "flag": "Liberia",
  "vesselType": "Container Ship",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "speed": 18.5,
  "course": 120,
  "status": "AT_SEA",
  "originPortId": "PORT_SANTOS",
  "destinationPortId": "PORT_SHANGHAI",
  "cargo": [...],
  "contractId": "CONTRACT_B2B_001",
  "contractType": "B2B",
  "cbs": 120000,
  "ibs": 170000,
  "importTax": 200000,
  "trackingHash": "a1b2c3d4e5f6"
}
```

#### Ports
```json
{
  "id": "PORT_SANTOS",
  "name": "Santos",
  "country": "Brazil",
  "region": "Sao Paulo",
  "latitude": -23.9608,
  "longitude": -46.3158,
  "UNLOCODE": "BRSAN",
  "type": "SEA",
  "size": "LARGE",
  "draught": 15,
  "containersCapacity": 4000000,
  "block": "BRASIL",
  "vesselsInPort": [...],
  "queuedVessels": [...],
  "estimatedWaitingTime": 0
}
```

#### Alerts
```json
{
  "id": "ALERT_123",
  "vesselId": "VSL_MSC_OSLO",
  "vesselName": "MSC Oslo",
  "type": "DEVIATION",
  "severity": "HIGH",
  "message": "Vessel deviated 60nm from route",
  "timestamp": "2024-01-01T12:00:00Z",
  "details": {...},
  "redFlagCode": "RF-DEV-ABCD",
  "requiresApproval": true,
  "playbook": "PB-01",
  "status": "ACTIVE",
  "icpTimestamp": "2024-01-01T12:00:00Z"
}
```

## Data Flow

1. **AIS Data Flow**:
   - AIS receivers collect vessel position data
   - Data is sent to AIS Service every 30 seconds
   - Vessel Service updates vessel positions
   - RedFlag Service checks for anomalies
   - Updates are broadcasted via WebSocket to frontend

2. **Satellite Data Flow**:
   - Sentinel Hub API provides satellite imagery
   - Sentinel Service processes images for vessel detection
   - Detected vessels are matched with AIS data
   - Updates are sent to frontend via WebSocket

3. **Alert Flow**:
   - RedFlag Service monitors vessel positions and status
   - Anomalies trigger alert creation
   - Alerts are stored with ICP-Brasil timestamp
   - Alerts are broadcasted to frontend
   - Operators acknowledge/resolve alerts

4. **Frontend Updates**:
   - WebSocket connection receives real-time updates
   - Map Module updates vessel markers
   - Tables are refreshed with new data
   - Charts are updated with new statistics

## Tax Calculation

The system automatically calculates taxes based on:

1. **CBS (Contribution on Goods and Services)**: 12% (Federal)
2. **IBS (Tax on Goods and Services)**: 17% (State/Municipal)
3. **Import Tax**: Based on destination port's block
   - Mercosul: 0%
   - BRICS/CPLP: 10%
   - Others: 20%

Tax calculation formula:
```
Total Tax = (Value * CBS Rate) + (Value * IBS Rate) + (Value * Import Tax Rate)
```

## RedFlag Engine

The RedFlag engine monitors for:

1. **Route Deviation**: Vessels deviating more than 50 nautical miles from planned route
2. **Unauthorized Stops**: Vessels stopped for more than 1 hour without authorization
3. **Documentation Issues**: Missing IMO, MMSI, or flag information
4. **High-Value Cargo**: Cargo exceeding R$ 1M or 10,000 units
5. **Customs Alerts**: Issues with customs documentation
6. **Tax Discrepancies**: Mismatches in tax calculations
7. **Container Issues**: Problems with container tracking

Each alert is assigned:
- A unique RedFlag code
- Severity level (LOW, MEDIUM, HIGH, CRITICAL)
- Playbook reference (PB-01 to PB-07)
- Responsible team
- SLA (Service Level Agreement)
- ICP-Brasil timestamp for audit

## Performance Considerations

1. **WebSocket Updates**: Updates are sent every 30 seconds for each vessel
2. **Caching**: AIS and satellite data are cached to reduce API calls
3. **Batch Processing**: Multiple updates are batched before broadcasting
4. **Lazy Loading**: Data is loaded on-demand for better performance
5. **Pagination**: Large datasets are paginated

## Security Considerations

1. **mTLS**: All internal communications use mutual TLS authentication
2. **API Keys**: External API keys are stored securely
3. **Audit Trail**: All actions are logged with ICP-Brasil timestamps
4. **No Automatic Destruction**: No automatic destructive actions (per RedFlag policy)
5. **Access Control**: Restricted access to sensitive operations

## Scalability

The system is designed to handle:
- 10,000+ concurrent vessels
- 1,000+ concurrent users
- 100+ updates per second
- Petabytes of satellite imagery data

Scaling strategies:
- Horizontal scaling of backend services
- Load balancing for WebSocket connections
- Database sharding for vessel data
- CDN for static assets

## Deployment

### Prerequisites
- Node.js 18+
- Docker (optional)
- AIS API access
- Sentinel Hub account
- mTLS certificates

### Installation
```bash
# Clone repository
cd satellite

# Install dependencies
cd backend
npm install

# Configure
cp config/default.json config/production.json
# Edit production.json with your API keys and settings

# Start server
npm start

# Or with Docker
cd ..
docker-compose up -d
```

### Environment Variables
```bash
# Server configuration
PORT=3000
WS_PORT=3001
NODE_ENV=production

# API Keys
SENTINEL_HUB_CLIENT_ID=your_client_id
SENTINEL_HUB_CLIENT_SECRET=your_client_secret
AIS_API_KEY=your_ais_api_key

# mTLS certificates
MTLS_CERT_PATH=/path/to/cert.pem
MTLS_KEY_PATH=/path/to/key.pem
MTLS_CA_PATH=/path/to/ca.pem
```

## API Documentation

See [API.md](API.md) for detailed API documentation.

## Monitoring

The system includes:
- Health check endpoint (`/health`)
- Logging for all operations
- Error tracking
- Performance metrics
- Alert monitoring

## Maintenance

Regular maintenance includes:
- Database backups
- Certificate rotation
- API key rotation
- Software updates
- Performance optimization
- Security audits
