const axios = require('axios');
const config = require('../config/default.json');

class AISService {
  constructor() {
    this.apiUrl = config.ais.apiUrl;
    this.apiKey = config.ais.apiKey;
    this.updateInterval = config.ais.updateInterval;
    this.cache = new Map();
  }

  async fetchAISData() {
    // In production, this would call the actual AIS API
    // For now, we'll simulate data updates
    
    try {
      // Try to fetch from real API if configured
      if (this.apiUrl && this.apiKey) {
        const response = await axios.get(`${this.apiUrl}/vessels`, {
          headers: {
            'x-api-key': this.apiKey
          },
          params: {
            lastUpdated: Date.now() - this.updateInterval
          }
        });
        
        return this.parseAISResponse(response.data);
      }
    } catch (error) {
      console.log('Using simulated AIS data (API not configured or error):', error.message);
    }
    
    // Return simulated updates
    return this.generateSimulatedUpdates();
  }

  parseAISResponse(apiData) {
    // Parse AIS API response into our format
    const updates = [];
    
    if (apiData && apiData.vessels) {
      apiData.vessels.forEach(vessel => {
        updates.push({
          vesselId: vessel.mmsi || vessel.id,
          latitude: vessel.latitude,
          longitude: vessel.longitude,
          speed: vessel.speed,
          course: vessel.course,
          heading: vessel.heading,
          timestamp: vessel.timestamp || new Date().toISOString()
        });
      });
    }
    
    return updates;
  }

  generateSimulatedUpdates() {
    // Generate random position updates for existing vessels
    const updates = [];
    const now = new Date().toISOString();
    
    // Simulate movement for sample vessels
    const sampleUpdates = [
      { vesselId: 'VSL_MSC_OSLO', latitude: -23.5505 - 0.01, longitude: -46.6333 + 0.02, speed: 18.5, course: 120, heading: 120, timestamp: now },
      { vesselId: 'VSL_COSCO_SHIP', latitude: -34.6037 + 0.015, longitude: -58.3816 - 0.01, speed: 20, course: 45, heading: 45, timestamp: now },
      { vesselId: 'VSL_VALE_BRASIL', latitude: -22.8167 - 0.02, longitude: -43.2500 + 0.015, speed: 15, course: 270, heading: 270, timestamp: now }
    ];
    
    return sampleUpdates;
  }

  async getVesselDetails(mmsi) {
    try {
      if (this.apiUrl && this.apiKey) {
        const response = await axios.get(`${this.apiUrl}/vessels/${mmsi}`, {
          headers: {
            'x-api-key': this.apiKey
          }
        });
        
        return this.parseVesselDetails(response.data);
      }
    } catch (error) {
      console.error('Error fetching vessel details:', error.message);
    }
    
    return null;
  }

  parseVesselDetails(apiData) {
    return {
      id: apiData.mmsi || apiData.id,
      name: apiData.name,
      imo: apiData.imo,
      mmsi: apiData.mmsi,
      flag: apiData.flag,
      vesselType: apiData.vesselType,
      length: apiData.length,
      width: apiData.width,
      draught: apiData.draught,
      grossTonnage: apiData.grossTonnage,
      deadweight: apiData.deadweight,
      latitude: apiData.latitude,
      longitude: apiData.longitude,
      speed: apiData.speed,
      course: apiData.course,
      heading: apiData.heading,
      timestamp: apiData.timestamp
    };
  }

  async searchVessels(params) {
    try {
      if (this.apiUrl && this.apiKey) {
        const response = await axios.get(`${this.apiUrl}/vessels`, {
          headers: {
            'x-api-key': this.apiKey
          },
          params
        });
        
        return this.parseAISResponse(response.data);
      }
    } catch (error) {
      console.error('Error searching vessels:', error.message);
    }
    
    return [];
  }

  // Cache management
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data, ttl = 300000) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = new AISService();
