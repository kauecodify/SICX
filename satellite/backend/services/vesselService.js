const Vessel = require('../models/Vessel');
const config = require('../config/default.json');

class VesselService {
  constructor() {
    this.vessels = new Map();
    this.subscribers = new Map();
    this.loadInitialData();
  }

  loadInitialData() {
    // Load initial vessel data from file or create sample data
    try {
      const fs = require('fs');
      const path = require('path');
      const vesselsPath = path.join(__dirname, config.ports.vesselsPath);
      
      if (fs.existsSync(vesselsPath)) {
        const files = fs.readdirSync(vesselsPath);
        files.forEach(file => {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(vesselsPath, file), 'utf8'));
            const vessel = new Vessel(data);
            this.vessels.set(vessel.id, vessel);
          } catch (error) {
            console.error(`Error loading vessel data from ${file}:`, error);
          }
        });
      }
    } catch (error) {
      console.log('Creating sample vessel data...');
      this.createSampleData();
    }
  }

  createSampleData() {
    // Create sample vessels for demonstration
    const sampleVessels = [
      {
        id: 'VSL_MSC_OSLO',
        name: 'MSC Oslo',
        imo: 9846523,
        mmsi: 245896000,
        flag: 'Liberia',
        vesselType: 'Container Ship',
        length: 366,
        width: 48,
        draught: 14.5,
        grossTonnage: 165000,
        deadweight: 180000,
        latitude: -23.5505,
        longitude: -46.6333,
        speed: 18.5,
        course: 120,
        heading: 120,
        currentRouteId: 'RTE_BR_CN_001',
        originPortId: 'PORT_SANTOS',
        destinationPortId: 'PORT_SHANGHAI',
        estimatedArrival: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        departureTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        cargo: [
          { containerId: 'CONT_001', type: '40ft', weight: 28, description: 'Electronics' },
          { containerId: 'CONT_002', type: '20ft', weight: 22, description: 'Machinery' }
        ],
        totalContainers: 8000,
        totalWeight: 150000,
        status: 'AT_SEA',
        contractId: 'CONTRACT_B2B_001',
        contractType: 'B2B',
        cbs: 120000,
        ibs: 170000,
        importTax: 200000
      },
      {
        id: 'VSL_COSCO_SHIP',
        name: 'COSCO Shipping Galaxy',
        imo: 9876543,
        mmsi: 470123456,
        flag: 'China',
        vesselType: 'Container Ship',
        length: 400,
        width: 58,
        draught: 16,
        grossTonnage: 200000,
        deadweight: 220000,
        latitude: -34.6037,
        longitude: -58.3816,
        speed: 20,
        course: 45,
        heading: 45,
        currentRouteId: 'RTE_AR_BR_001',
        originPortId: 'PORT_BUENOS_AIRES',
        destinationPortId: 'PORT_SANTOS',
        estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        departureTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        cargo: [
          { containerId: 'CONT_003', type: '40ft', weight: 25, description: 'Agricultural Products' }
        ],
        totalContainers: 12000,
        totalWeight: 200000,
        status: 'AT_SEA',
        contractId: 'CONTRACT_MERCOSUL_001',
        contractType: 'B2B',
        cbs: 0,
        ibs: 0,
        importTax: 0
      },
      {
        id: 'VSL_VALE_BRASIL',
        name: 'Vale Brasil',
        imo: 9656020,
        mmsi: 710000123,
        flag: 'Brazil',
        vesselType: 'Bulk Carrier',
        length: 327,
        width: 55,
        draught: 18,
        grossTonnage: 180000,
        deadweight: 380000,
        latitude: -22.8167,
        longitude: -43.2500,
        speed: 15,
        course: 270,
        heading: 270,
        currentRouteId: 'RTE_BR_ZA_001',
        originPortId: 'PORT_RIO_DE_JANEIRO',
        destinationPortId: 'PORT_DURBAN',
        estimatedArrival: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        departureTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        cargo: [
          { containerId: 'CONT_004', type: 'Bulk', weight: 180000, description: 'Iron Ore' }
        ],
        totalContainers: 0,
        totalWeight: 180000,
        status: 'AT_SEA',
        contractId: 'CONTRACT_BRICS_001',
        contractType: 'B2G',
        cbs: 36000,
        ibs: 51000,
        importTax: 18000
      }
    ];

    sampleVessels.forEach(data => {
      const vessel = new Vessel(data);
      this.vessels.set(vessel.id, vessel);
    });
  }

  getAllVessels() {
    return Array.from(this.vessels.values()).map(v => v.toJSON());
  }

  getVessel(vesselId) {
    return this.vessels.get(vesselId);
  }

  getVesselDetails(vesselId) {
    const vessel = this.vessels.get(vesselId);
    if (!vessel) return null;
    
    return {
      ...vessel.toJSON(),
      positionHistory: this.getPositionHistory(vesselId),
      alerts: this.getVesselAlerts(vesselId)
    };
  }

  getPositionHistory(vesselId, limit = 10) {
    // In a real implementation, this would come from a database
    return [];
  }

  getVesselAlerts(vesselId) {
    // In a real implementation, this would query the alert service
    return [];
  }

  addVessel(vesselData) {
    const vessel = new Vessel(vesselData);
    this.vessels.set(vessel.id, vessel);
    return vessel;
  }

  updateVessel(vesselId, updates) {
    const vessel = this.vessels.get(vesselId);
    if (!vessel) return null;
    
    Object.assign(vessel, updates);
    return vessel;
  }

  updateVesselPosition(update) {
    const vessel = this.vessels.get(update.vesselId);
    if (!vessel) return false;
    
    vessel.updatePosition(
      update.latitude,
      update.longitude,
      update.speed,
      update.course,
      update.heading,
      update.timestamp
    );
    
    // Notify subscribers
    this.notifySubscribers(vesselId, vessel.toJSON());
    return true;
  }

  removeVessel(vesselId) {
    this.vessels.delete(vesselId);
    return true;
  }

  subscribeToVessel(vesselId, callback) {
    if (!this.subscribers.has(vesselId)) {
      this.subscribers.set(vesselId, new Set());
    }
    this.subscribers.get(vesselId).add(callback);
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(vesselId);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(vesselId);
        }
      }
    };
  }

  notifySubscribers(vesselId, data) {
    const subs = this.subscribers.get(vesselId);
    if (subs) {
      subs.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  filterVessels(filters) {
    let vessels = Array.from(this.vessels.values());
    
    if (filters.status) {
      vessels = vessels.filter(v => v.status === filters.status);
    }
    
    if (filters.originPortId) {
      vessels = vessels.filter(v => v.originPortId === filters.originPortId);
    }
    
    if (filters.destinationPortId) {
      vessels = vessels.filter(v => v.destinationPortId === filters.destinationPortId);
    }
    
    if (filters.flag) {
      vessels = vessels.filter(v => v.flag === filters.flag);
    }
    
    if (filters.contractType) {
      vessels = vessels.filter(v => v.contractType === filters.contractType);
    }
    
    if (filters.minSpeed) {
      vessels = vessels.filter(v => v.speed >= filters.minSpeed);
    }
    
    if (filters.maxSpeed) {
      vessels = vessels.filter(v => v.speed <= filters.maxSpeed);
    }
    
    return vessels.map(v => v.toJSON());
  }

  getVesselsByPort(portId) {
    return Array.from(this.vessels.values())
      .filter(v => v.originPortId === portId || v.destinationPortId === portId)
      .map(v => v.toJSON());
  }

  getVesselsInRange(latitude, longitude, radiusKm) {
    const R = 6371; // Earth radius in km
    const toRadians = (degrees) => degrees * Math.PI / 180;
    
    return Array.from(this.vessels.values())
      .filter(vessel => {
        const lat1 = toRadians(latitude);
        const lon1 = toRadians(longitude);
        const lat2 = toRadians(vessel.latitude);
        const lon2 = toRadians(vessel.longitude);
        
        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance <= radiusKm;
      })
      .map(v => v.toJSON());
  }
}

module.exports = new VesselService();
