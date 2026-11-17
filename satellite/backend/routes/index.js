const express = require('express');
const router = express.Router();
const vesselService = require('../services/vesselService');
const portService = require('../services/portService');
const aisService = require('../services/aisService');
const sentinelService = require('../services/sentinelService');
const redFlagService = require('../services/redFlagService');
const config = require('../config/default.json');

// Vessel routes
router.get('/vessels', (req, res) => {
  try {
    const filters = req.query;
    const vessels = vesselService.filterVessels(filters);
    res.json(vessels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vessels/:id', (req, res) => {
  try {
    const vessel = vesselService.getVesselDetails(req.params.id);
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    res.json(vessel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/vessels', (req, res) => {
  try {
    const vessel = vesselService.addVessel(req.body);
    res.status(201).json(vessel.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/vessels/:id', (req, res) => {
  try {
    const vessel = vesselService.updateVessel(req.params.id, req.body);
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    res.json(vessel.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/vessels/:id', (req, res) => {
  try {
    const result = vesselService.removeVessel(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    res.json({ message: 'Vessel removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Port routes
router.get('/ports', (req, res) => {
  try {
    const filters = req.query;
    const ports = portService.filterPorts(filters);
    res.json(ports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ports/:id', (req, res) => {
  try {
    const port = portService.getPort(req.params.id);
    if (!port) {
      return res.status(404).json({ error: 'Port not found' });
    }
    res.json(port.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ports/country/:country', (req, res) => {
  try {
    const ports = portService.getPortsByCountry(req.params.country);
    res.json(ports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ports/block/:block', (req, res) => {
  try {
    const ports = portService.getPortsByBlock(req.params.block);
    res.json(ports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AIS routes
router.get('/ais/vessels', async (req, res) => {
  try {
    const vessels = await aisService.searchVessels(req.query);
    res.json(vessels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ais/vessels/:mmsi', async (req, res) => {
  try {
    const vessel = await aisService.getVesselDetails(req.params.mmsi);
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    res.json(vessel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sentinel Hub routes
router.get('/sentinel/images', async (req, res) => {
  try {
    const bbox = req.query.bbox ? req.query.bbox.split(',').map(Number) : null;
    const timeRange = req.query.timeRange ? {
      from: req.query.from,
      to: req.query.to
    } : null;
    
    const data = await sentinelService.fetchSatelliteData(bbox, timeRange);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sentinel/detect-vessels', async (req, res) => {
  try {
    const bbox = req.query.bbox ? req.query.bbox.split(',').map(Number) : null;
    const timeRange = req.query.timeRange ? {
      from: req.query.from,
      to: req.query.to
    } : null;
    
    const data = await sentinelService.detectVesselsInArea(bbox, timeRange);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sentinel/weather', async (req, res) => {
  try {
    const bbox = req.query.bbox ? req.query.bbox.split(',').map(Number) : null;
    const weather = await sentinelService.getWeatherConditions(bbox);
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RedFlag routes
router.get('/alerts', (req, res) => {
  try {
    const filters = req.query;
    const alerts = redFlagService.filterAlerts(filters);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/alerts/:id', (req, res) => {
  try {
    const alert = redFlagService.getAlert(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/alerts/vessel/:vesselId', (req, res) => {
  try {
    const alerts = redFlagService.getAlertsForVessel(req.params.vesselId);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/alerts', (req, res) => {
  try {
    const alert = redFlagService.createAlert(req.body);
    res.status(201).json(alert.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/alerts/:id/acknowledge', (req, res) => {
  try {
    const alert = redFlagService.acknowledgeAlert(req.params.id, req.body.user);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/alerts/:id/resolve', (req, res) => {
  try {
    const alert = redFlagService.resolveAlert(
      req.params.id,
      req.body.user,
      req.body.notes
    );
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/alerts/statistics', (req, res) => {
  try {
    const stats = redFlagService.getAlertStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistics routes
router.get('/statistics', (req, res) => {
  try {
    const vesselStats = {
      total: vesselService.getAllVessels().length,
      atSea: vesselService.filterVessels({ status: 'AT_SEA' }).length,
      anchored: vesselService.filterVessels({ status: 'ANCHORED' }).length,
      moored: vesselService.filterVessels({ status: 'MOORED' }).length
    };
    
    const portStats = portService.getPortStatistics();
    const alertStats = redFlagService.getAlertStatistics();
    
    res.json({
      vessels: vesselStats,
      ports: portStats,
      alerts: alertStats,
      taxRates: config.taxRates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tax calculation routes
router.post('/calculate-tax', (req, res) => {
  try {
    const { value, originPortId, destinationPortId, contractType } = req.body;
    
    const originPort = portService.getPort(originPortId);
    const destinationPort = portService.getPort(destinationPortId);
    
    if (!originPort || !destinationPort) {
      return res.status(400).json({ error: 'Invalid port IDs' });
    }
    
    // Get tax rates based on destination port's block
    let importTaxRate = 0;
    if (destinationPort.block === 'MERCOSUL') {
      importTaxRate = config.taxRates.importMercosul;
    } else if (destinationPort.block === 'BRICS' || destinationPort.block === 'CPLP') {
      importTaxRate = config.taxRates.importBRICS;
    } else {
      importTaxRate = config.taxRates.importOther;
    }
    
    const cbs = value * config.taxRates.CBS;
    const ibs = value * config.taxRates.IBS;
    const importTax = value * importTaxRate;
    const totalTax = cbs + ibs + importTax;
    
    res.json({
      value,
      cbs,
      ibs,
      importTax,
      importTaxRate,
      totalTax,
      originPort: originPort.name,
      destinationPort: destinationPort.name,
      contractType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Export routes
module.exports = router;
