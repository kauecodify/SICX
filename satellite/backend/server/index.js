const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('../config/default.json');
const vesselService = require('../services/vesselService');
const aisService = require('../services/aisService');
const sentinelService = require('../services/sentinelService');
const redFlagService = require('../services/redFlagService');
const portService = require('../services/portService');

// Initialize Express app
const app = express();
const serverPort = config.server.port;
const wsPort = config.server.websocketPort;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
const routes = require('../routes');
app.use('/api', routes);

// Serve static files
app.use(express.static('../../frontend'));

// Initialize services
const services = {
  vesselService,
  aisService,
  sentinelService,
  redFlagService,
  portService
};

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: wsPort });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  // Send initial data on connection
  const initialData = {
    type: 'INITIAL_DATA',
    vessels: vesselService.getAllVessels(),
    ports: portService.getAllPorts(),
    alerts: redFlagService.getActiveAlerts()
  };
  ws.send(JSON.stringify(initialData));

  // Handle messages from client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data, services);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Broadcast updates to all connected clients
function broadcastUpdate(type, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, data }));
    }
  });
}

// Handle WebSocket messages
function handleWebSocketMessage(ws, message, services) {
  switch (message.type) {
    case 'SUBSCRIBE_VESSEL':
      vesselService.subscribeToVessel(message.vesselId, (update) => {
        ws.send(JSON.stringify({ type: 'VESSEL_UPDATE', data: update }));
      });
      break;
    case 'SUBSCRIBE_ALERTS':
      redFlagService.subscribeToAlerts((alert) => {
        ws.send(JSON.stringify({ type: 'NEW_ALERT', data: alert }));
      });
      break;
    case 'REQUEST_VESSEL_DETAILS':
      const vesselDetails = vesselService.getVesselDetails(message.vesselId);
      ws.send(JSON.stringify({ type: 'VESSEL_DETAILS', data: vesselDetails }));
      break;
    default:
      console.log('Unknown message type:', message.type);
  }
}

// Start AIS update interval
setInterval(async () => {
  try {
    const updates = await aisService.fetchAISData();
    updates.forEach(update => {
      vesselService.updateVesselPosition(update);
      
      // Check for RedFlag conditions
      const vessel = vesselService.getVessel(update.vesselId);
      if (vessel) {
        const alerts = redFlagService.checkVesselForAlerts(vessel);
        alerts.forEach(alert => {
          broadcastUpdate('NEW_ALERT', alert);
        });
      }
    });
    
    broadcastUpdate('VESSEL_POSITIONS', updates);
  } catch (error) {
    console.error('Error fetching AIS data:', error);
  }
}, config.ais.updateInterval);

// Start Sentinel Hub update interval
setInterval(async () => {
  try {
    const satelliteData = await sentinelService.fetchSatelliteData();
    broadcastUpdate('SATELLITE_DATA', satelliteData);
  } catch (error) {
    console.error('Error fetching satellite data:', error);
  }
}, 60000); // Every minute

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start HTTP server
app.listen(serverPort, () => {
  console.log(`HTTP server running on port ${serverPort}`);
  console.log(`WebSocket server running on port ${wsPort}`);
});

// Export for testing
module.exports = { app, wss, broadcastUpdate, services };
