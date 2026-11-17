# SICX Satellite Tracking - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All endpoints require mTLS authentication for internal requests. External requests may require API keys.

## Endpoints

### Vessels

#### GET /vessels
List all vessels with optional filtering.

**Query Parameters:**
- `status`: Filter by status (AT_SEA, ANCHORED, MOORED)
- `originPortId`: Filter by origin port
- `destinationPortId`: Filter by destination port
- `flag`: Filter by flag
- `contractType`: Filter by contract type (B2B, B2G)
- `minSpeed`: Minimum speed filter
- `maxSpeed`: Maximum speed filter

**Response:**
```json
[
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
    "cbs": 120000,
    "ibs": 170000,
    "importTax": 200000,
    "trackingHash": "a1b2c3d4e5f6"
  }
]
```

#### GET /vessels/:id
Get details for a specific vessel.

**Response:**
```json
{
  "id": "VSL_MSC_OSLO",
  "name": "MSC Oslo",
  "imo": 9846523,
  "mmsi": 245896000,
  "flag": "Liberia",
  "vesselType": "Container Ship",
  "length": 366,
  "width": 48,
  "draught": 14.5,
  "grossTonnage": 165000,
  "deadweight": 180000,
  "latitude": -23.5505,
  "longitude": -46.6333,
  "speed": 18.5,
  "course": 120,
  "heading": 120,
  "timestamp": "2024-01-01T12:00:00Z",
  "currentRouteId": "RTE_BR_CN_001",
  "originPortId": "PORT_SANTOS",
  "destinationPortId": "PORT_SHANGHAI",
  "estimatedArrival": "2024-01-25T00:00:00Z",
  "departureTime": "2024-01-01T00:00:00Z",
  "cargo": [...],
  "totalContainers": 8000,
  "totalWeight": 150000,
  "status": "AT_SEA",
  "contractId": "CONTRACT_B2B_001",
  "contractType": "B2B",
  "cbs": 120000,
  "ibs": 170000,
  "importTax": 200000,
  "trackingHash": "a1b2c3d4e5f6",
  "positionHistory": [...],
  "alerts": [...]
}
```

#### POST /vessels
Create a new vessel.

**Request Body:**
```json
{
  "name": "New Vessel",
  "imo": 1234567,
  "mmsi": 123456789,
  "flag": "Brazil",
  "vesselType": "Container Ship",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "speed": 18.5,
  "course": 120
}
```

**Response:**
```json
{
  "id": "VSL_NEW_001",
  "name": "New Vessel",
  ...
}
```

#### PUT /vessels/:id
Update a vessel.

**Request Body:**
```json
{
  "latitude": -24.0,
  "longitude": -47.0,
  "speed": 20.0
}
```

**Response:**
```json
{
  "id": "VSL_MSC_OSLO",
  "name": "MSC Oslo",
  ...
}
```

#### DELETE /vessels/:id
Delete a vessel.

**Response:**
```json
{
  "message": "Vessel removed successfully"
}
```

### Ports

#### GET /ports
List all ports with optional filtering.

**Query Parameters:**
- `country`: Filter by country
- `region`: Filter by region
- `block`: Filter by block (BRASIL, MERCOSUL, BRICS, CPLP)
- `size`: Filter by size (LARGE, MEDIUM, SMALL)
- `type`: Filter by type (SEA, RIVER)
- `customsIntegration`: Filter by customs integration

**Response:**
```json
[
  {
    "id": "PORT_SANTOS",
    "name": "Santos",
    "code": "BRSAN",
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
]
```

#### GET /ports/:id
Get details for a specific port.

**Response:**
```json
{
  "id": "PORT_SANTOS",
  "name": "Santos",
  ...
}
```

#### GET /ports/country/:country
Get ports by country.

**Response:**
```json
[
  {
    "id": "PORT_SANTOS",
    "name": "Santos",
    ...
  }
]
```

#### GET /ports/block/:block
Get ports by block.

**Response:**
```json
[
  {
    "id": "PORT_SANTOS",
    "name": "Santos",
    ...
  }
]
```

### AIS

#### GET /ais/vessels
Search for vessels using AIS data.

**Query Parameters:**
- `mmsi`: Filter by MMSI
- `imo`: Filter by IMO
- `name`: Filter by vessel name
- `lastUpdated`: Filter by last update time

**Response:**
```json
[
  {
    "vesselId": "VSL_MSC_OSLO",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "speed": 18.5,
    "course": 120,
    "heading": 120,
    "timestamp": "2024-01-01T12:00:00Z"
  }
]
```

#### GET /ais/vessels/:mmsi
Get AIS data for a specific vessel.

**Response:**
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
  "heading": 120,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Sentinel Hub

#### GET /sentinel/images
Get satellite images for a specific area.

**Query Parameters:**
- `bbox`: Bounding box (minLon,minLat,maxLon,maxLat)
- `from`: Start date (ISO 8601)
- `to`: End date (ISO 8601)

**Response:**
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "images": [
    {
      "url": "https://...",
      "timestamp": "2024-01-01T12:00:00Z",
      "bbox": [-70, -40, -60, -30]
    }
  ],
  "vesselsDetected": [
    {
      "id": "VSL_MSC_OSLO",
      "latitude": -23.5505,
      "longitude": -46.6333,
      "confidence": 0.95
    }
  ]
}
```

#### GET /sentinel/detect-vessels
Detect vessels in a specific area using satellite imagery.

**Query Parameters:**
- `bbox`: Bounding box (minLon,minLat,maxLon,maxLat)
- `from`: Start date (ISO 8601)
- `to`: End date (ISO 8601)

**Response:**
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "images": [...],
  "vesselsDetected": [...]
}
```

#### GET /sentinel/weather
Get weather conditions for a specific area.

**Query Parameters:**
- `bbox`: Bounding box (minLon,minLat,maxLon,maxLat)

**Response:**
```json
{
  "windSpeed": 15,
  "windDirection": 120,
  "waveHeight": 2.5,
  "visibility": 10,
  "temperature": 22,
  "conditions": "FAIR"
}
```

### Alerts

#### GET /alerts
List all alerts with optional filtering.

**Query Parameters:**
- `type`: Filter by alert type
- `severity`: Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
- `status`: Filter by status (ACTIVE, ACKNOWLEDGED, RESOLVED)
- `vesselId`: Filter by vessel ID
- `requiresApproval`: Filter by approval requirement
- `startDate`: Filter by start date
- `endDate`: Filter by end date

**Response:**
```json
[
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
    "responsible": "OPERATIONS_TEAM",
    "sla": 30,
    "status": "ACTIVE",
    "icpTimestamp": "2024-01-01T12:00:00Z"
  }
]
```

#### GET /alerts/:id
Get details for a specific alert.

**Response:**
```json
{
  "id": "ALERT_123",
  ...
}
```

#### GET /alerts/vessel/:vesselId
Get alerts for a specific vessel.

**Response:**
```json
[
  {
    "id": "ALERT_123",
    ...
  }
]
```

#### POST /alerts
Create a new alert.

**Request Body:**
```json
{
  "vesselId": "VSL_MSC_OSLO",
  "vesselName": "MSC Oslo",
  "type": "DEVIATION",
  "severity": "HIGH",
  "message": "Vessel deviated from route",
  "details": {...}
}
```

**Response:**
```json
{
  "id": "ALERT_123",
  ...
}
```

#### PUT /alerts/:id/acknowledge
Acknowledge an alert.

**Request Body:**
```json
{
  "user": "OPERATOR"
}
```

**Response:**
```json
{
  "id": "ALERT_123",
  "status": "ACKNOWLEDGED",
  ...
}
```

#### PUT /alerts/:id/resolve
Resolve an alert.

**Request Body:**
```json
{
  "user": "OPERATOR",
  "notes": "Issue resolved"
}
```

**Response:**
```json
{
  "id": "ALERT_123",
  "status": "RESOLVED",
  "resolvedAt": "2024-01-01T12:30:00Z",
  "resolvedBy": "OPERATOR",
  "resolutionNotes": "Issue resolved",
  ...
}
```

#### GET /alerts/statistics
Get alert statistics.

**Response:**
```json
{
  "total": 100,
  "active": 10,
  "acknowledged": 50,
  "resolved": 40,
  "byType": {
    "DEVIATION": 30,
    "UNAUTHORIZED_STOP": 20,
    ...
  },
  "bySeverity": {
    "LOW": 20,
    "MEDIUM": 50,
    ...
  },
  "byStatus": {
    "ACTIVE": 10,
    "ACKNOWLEDGED": 50,
    ...
  },
  "requiresApproval": 15
}
```

### Statistics

#### GET /statistics
Get overall system statistics.

**Response:**
```json
{
  "vessels": {
    "total": 1000,
    "atSea": 800,
    "anchored": 100,
    "moored": 100
  },
  "ports": {
    "total": 27,
    "byCountry": {...},
    "byBlock": {...},
    "bySize": {...},
    "byType": {...},
    "withCustoms": 27,
    "totalCapacity": 100000000
  },
  "alerts": {
    "total": 100,
    "active": 10,
    ...
  },
  "taxRates": {
    "CBS": 0.12,
    "IBS": 0.17,
    "importMercosul": 0.00,
    "importBRICS": 0.10,
    "importCPLP": 0.10,
    "importOther": 0.20
  }
}
```

### Tax Calculation

#### POST /calculate-tax
Calculate taxes for a transaction.

**Request Body:**
```json
{
  "value": 1000000,
  "originPortId": "PORT_SANTOS",
  "destinationPortId": "PORT_SHANGHAI",
  "contractType": "B2B"
}
```

**Response:**
```json
{
  "value": 1000000,
  "cbs": 120000,
  "ibs": 170000,
  "importTax": 200000,
  "importTaxRate": 0.20,
  "totalTax": 490000,
  "originPort": "Santos",
  "destinationPort": "Shanghai",
  "contractType": "B2B",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Health Check

#### GET /health
Check system health.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0"
}
```

## WebSocket API

### Connection
```
ws://localhost:3001
```

### Message Types

#### Client to Server

**INITIAL_DATA**
Request initial data on connection.
```json
{
  "type": "INITIAL_DATA"
}
```

**SUBSCRIBE_VESSEL**
Subscribe to updates for a specific vessel.
```json
{
  "type": "SUBSCRIBE_VESSEL",
  "vesselId": "VSL_MSC_OSLO"
}
```

**SUBSCRIBE_ALERTS**
Subscribe to new alerts.
```json
{
  "type": "SUBSCRIBE_ALERTS"
}
```

**REQUEST_VESSEL_DETAILS**
Request detailed information for a vessel.
```json
{
  "type": "REQUEST_VESSEL_DETAILS",
  "vesselId": "VSL_MSC_OSLO"
}
```

#### Server to Client

**INITIAL_DATA**
Initial data including vessels, ports, and alerts.
```json
{
  "type": "INITIAL_DATA",
  "vessels": [...],
  "ports": [...],
  "alerts": [...]
}
```

**VESSEL_POSITIONS**
Batch update of vessel positions.
```json
{
  "type": "VESSEL_POSITIONS",
  "data": [
    {
      "vesselId": "VSL_MSC_OSLO",
      "latitude": -23.5505,
      "longitude": -46.6333,
      "speed": 18.5,
      "course": 120,
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ]
}
```

**VESSEL_UPDATE**
Update for a specific vessel.
```json
{
  "type": "VESSEL_UPDATE",
  "data": {
    "id": "VSL_MSC_OSLO",
    ...
  }
}
```

**NEW_ALERT**
New alert created.
```json
{
  "type": "NEW_ALERT",
  "data": {
    "id": "ALERT_123",
    ...
  }
}
```

**VESSEL_DETAILS**
Detailed information for a vessel.
```json
{
  "type": "VESSEL_DETAILS",
  "data": {
    "id": "VSL_MSC_OSLO",
    ...
  }
}
```

**SATELLITE_DATA**
Satellite data update.
```json
{
  "type": "SATELLITE_DATA",
  "data": {
    "timestamp": "2024-01-01T12:00:00Z",
    "images": [...],
    "vesselsDetected": [...]
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 405 | Method Not Allowed |
| 500 | Internal Server Error |
| 502 | Bad Gateway |
| 503 | Service Unavailable |

## Rate Limiting

- API: 100 requests per minute per client
- WebSocket: 10 updates per second per client
- Burst: 1000 requests per minute allowed

## Versioning

The API is versioned using the URL path:
```
/api/v1/...
```

Currently, only version 1 is available.

## Deprecation Policy

- Deprecated endpoints will be announced 30 days in advance
- Deprecated endpoints will continue to work for 90 days
- After 90 days, deprecated endpoints will be removed

## Support

For API support, contact:
- Email: sicx-support@government.br
- Phone: +55 0800 123 4567
- Hours: 24/7
