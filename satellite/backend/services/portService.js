const Port = require('../models/Port');
const config = require('../config/default.json');

class PortService {
  constructor() {
    this.ports = new Map();
    this.loadInitialData();
  }

  loadInitialData() {
    // Load port data from files
    try {
      const fs = require('fs');
      const path = require('path');
      const portsPath = path.join(__dirname, config.ports.dataPath);
      
      if (fs.existsSync(portsPath)) {
        const files = fs.readdirSync(portsPath);
        files.forEach(file => {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(portsPath, file), 'utf8'));
            const port = new Port(data);
            this.ports.set(port.id, port);
          } catch (error) {
            console.error(`Error loading port data from ${file}:`, error);
          }
        });
      }
    } catch (error) {
      console.log('Creating sample port data...');
      this.createSampleData();
    }
  }

  createSampleData() {
    // Create sample ports for all 27 ports
    const samplePorts = [
      // Brazil (10 ports)
      {
        id: 'PORT_SANTOS',
        name: 'Santos',
        code: 'BRSAN',
        country: 'Brazil',
        region: 'Sao Paulo',
        latitude: -23.9608,
        longitude: -46.3158,
        UNLOCODE: 'BRSAN',
        type: 'SEA',
        size: 'LARGE',
        draught: 15,
        containersCapacity: 4000000,
        berths: ['Berth 1', 'Berth 2', 'Berth 3'],
        facilities: ['Container Terminal', 'Bulk Terminal', 'Liquid Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'America/Sao_Paulo'
      },
      {
        id: 'PORT_PARANAGUA',
        name: 'Paranagua',
        code: 'BRPNG',
        country: 'Brazil',
        region: 'Parana',
        latitude: -25.5167,
        longitude: -48.5000,
        UNLOCODE: 'BRPNG',
        type: 'SEA',
        size: 'LARGE',
        draught: 14,
        containersCapacity: 2500000,
        berths: ['Berth A', 'Berth B'],
        facilities: ['Container Terminal', 'Grain Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'America/Sao_Paulo'
      },
      {
        id: 'PORT_RIO_GRANDE',
        name: 'Rio Grande',
        code: 'BRRIG',
        country: 'Brazil',
        region: 'Rio Grande do Sul',
        latitude: -32.0356,
        longitude: -52.0989,
        UNLOCODE: 'BRRIG',
        type: 'SEA',
        size: 'MEDIUM',
        draught: 12,
        containersCapacity: 1000000,
        berths: ['Berth 1', 'Berth 2'],
        facilities: ['Container Terminal', 'Automotive Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'America/Sao_Paulo'
      },
      {
        id: 'PORT_SUAPE',
        name: 'Suape',
        code: 'BRSUE',
        country: 'Brazil',
        region: 'Pernambuco',
        latitude: -8.3833,
        longitude: -34.9667,
        UNLOCODE: 'BRSUE',
        type: 'SEA',
        size: 'LARGE',
        draught: 16,
        containersCapacity: 1500000,
        berths: ['Berth 1', 'Berth 2', 'Berth 3'],
        facilities: ['Container Terminal', 'Petrochemical Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'America/Recife'
      },
      {
        id: 'PORT_ITAQUI',
        name: 'Itaqui',
        code: 'BRITQ',
        country: 'Brazil',
        region: 'Maranhao',
        latitude: -2.5833,
        longitude: -44.3000,
        UNLOCODE: 'BRITQ',
        type: 'SEA',
        size: 'MEDIUM',
        draught: 13,
        containersCapacity: 800000,
        berths: ['Berth A', 'Berth B'],
        facilities: ['Bulk Terminal', 'Container Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'America/Fortaleza'
      },
      {
        id: 'PORT_VITORIA',
        name: 'Vitoria',
        code: 'BRVIX',
        country: 'Brazil',
        region: 'Espirito Santo',
        latitude: -20.3167,
        longitude: -40.3500,
        UNLOCODE: 'BRVIX',
        type: 'SEA',
        size: 'MEDIUM',
        draught: 12,
        containersCapacity: 600000,
        berths: ['Berth 1', 'Berth 2'],
        facilities: ['Container Terminal', 'Bulk Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'America/Sao_Paulo'
      },
      {
        id: 'PORT_SALVADOR',
        name: 'Salvador',
        code: 'BRSSA',
        country: 'Brazil',
        region: 'Bahia',
        latitude: -12.9714,
        longitude: -38.5014,
        UNLOCODE: 'BRSSA',
        type: 'SEA',
        size: 'LARGE',
        draught: 14,
        containersCapacity: 1200000,
        berths: ['Berth 1', 'Berth 2', 'Berth 3'],
        facilities: ['Container Terminal', 'Automotive Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'America/Bahia'
      },
      {
        id: 'PORT_MANAUS',
        name: 'Manaus',
        code: 'BRMAO',
        country: 'Brazil',
        region: 'Amazonas',
        latitude: -3.1190,
        longitude: -60.0217,
        UNLOCODE: 'BRMAO',
        type: 'RIVER',
        size: 'MEDIUM',
        draught: 10,
        containersCapacity: 500000,
        berths: ['Berth A', 'Berth B'],
        facilities: ['Container Terminal', 'Bulk Terminal'],
        customsIntegration: true,
        operationalHours: '08:00-18:00',
        timezone: 'America/Manaus'
      },
      {
        id: 'PORT_BELEM',
        name: 'Belem',
        code: 'BRBEL',
        country: 'Brazil',
        region: 'Para',
        latitude: -1.4558,
        longitude: -48.5044,
        UNLOCODE: 'BRBEL',
        type: 'RIVER',
        size: 'MEDIUM',
        draught: 11,
        containersCapacity: 400000,
        berths: ['Berth 1', 'Berth 2'],
        facilities: ['Container Terminal', 'Bulk Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'America/Belem'
      },
      {
        id: 'PORT_RIO_DE_JANEIRO',
        name: 'Rio de Janeiro',
        code: 'BRRIO',
        country: 'Brazil',
        region: 'Rio de Janeiro',
        latitude: -22.8950,
        longitude: -43.1833,
        UNLOCODE: 'BRRIO',
        type: 'SEA',
        size: 'LARGE',
        draught: 14,
        containersCapacity: 1800000,
        berths: ['Berth 1', 'Berth 2', 'Berth 3', 'Berth 4'],
        facilities: ['Container Terminal', 'Bulk Terminal', 'Liquid Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'America/Sao_Paulo'
      },
      // Mercosul (4 ports)
      {
        id: 'PORT_BUENOS_AIRES',
        name: 'Buenos Aires',
        code: 'ARBUE',
        country: 'Argentina',
        region: 'Buenos Aires',
        latitude: -34.6037,
        longitude: -58.3816,
        UNLOCODE: 'ARBUE',
        type: 'SEA',
        size: 'LARGE',
        draught: 13,
        containersCapacity: 2000000,
        berths: ['Berth A', 'Berth B', 'Berth C'],
        facilities: ['Container Terminal', 'Grain Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'America/Argentina/Buenos_Aires'
      },
      {
        id: 'PORT_MONTEVIDEO',
        name: 'Montevideo',
        code: 'UYMVD',
        country: 'Uruguay',
        region: 'Montevideo',
        latitude: -34.9011,
        longitude: -56.1645,
        UNLOCODE: 'UYMVD',
        type: 'SEA',
        size: 'MEDIUM',
        draught: 12,
        containersCapacity: 1000000,
        berths: ['Berth 1', 'Berth 2'],
        facilities: ['Container Terminal', 'Bulk Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'America/Montevideo'
      },
      {
        id: 'PORT_ASUNCION',
        name: 'Asuncion',
        code: 'PYAUN',
        country: 'Paraguay',
        region: 'Asuncion',
        latitude: -25.2896,
        longitude: -57.6538,
        UNLOCODE: 'PYAUN',
        type: 'RIVER',
        size: 'SMALL',
        draught: 8,
        containersCapacity: 200000,
        berths: ['Berth 1'],
        facilities: ['Container Terminal'],
        customsIntegration: true,
        operationalHours: '08:00-18:00',
        timezone: 'America/Asuncion'
      },
      {
        id: 'PORT_IQUIQUE',
        name: 'Iquique',
        code: 'CLIQQ',
        country: 'Chile',
        region: 'Tarapaca',
        latitude: -20.2022,
        longitude: -70.1439,
        UNLOCODE: 'CLIQQ',
        type: 'SEA',
        size: 'MEDIUM',
        draught: 11,
        containersCapacity: 800000,
        berths: ['Berth A', 'Berth B'],
        facilities: ['Container Terminal', 'Bulk Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'America/Santiago'
      },
      // BRICS (8 ports)
      {
        id: 'PORT_SHANGHAI',
        name: 'Shanghai',
        code: 'CNSHA',
        country: 'China',
        region: 'Shanghai',
        latitude: 31.2304,
        longitude: 121.4737,
        UNLOCODE: 'CNSHA',
        type: 'SEA',
        size: 'LARGE',
        draught: 18,
        containersCapacity: 40000000,
        berths: ['Berth 1', 'Berth 2', 'Berth 3', 'Berth 4', 'Berth 5'],
        facilities: ['Container Terminal', 'Bulk Terminal', 'Liquid Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'Asia/Shanghai'
      },
      {
        id: 'PORT_MUMBAI',
        name: 'Mumbai',
        code: 'INBOM',
        country: 'India',
        region: 'Maharashtra',
        latitude: 19.0760,
        longitude: 72.8777,
        UNLOCODE: 'INBOM',
        type: 'SEA',
        size: 'LARGE',
        draught: 15,
        containersCapacity: 6000000,
        berths: ['Berth A', 'Berth B', 'Berth C'],
        facilities: ['Container Terminal', 'Bulk Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'Asia/Kolkata'
      },
      {
        id: 'PORT_DURBAN',
        name: 'Durban',
        code: 'ZADUR',
        country: 'South Africa',
        region: 'KwaZulu-Natal',
        latitude: -29.8587,
        longitude: 31.0218,
        UNLOCODE: 'ZADUR',
        type: 'SEA',
        size: 'LARGE',
        draught: 16,
        containersCapacity: 3000000,
        berths: ['Berth 1', 'Berth 2', 'Berth 3'],
        facilities: ['Container Terminal', 'Bulk Terminal', 'Automotive Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'Africa/Johannesburg'
      },
      {
        id: 'PORT_ALEXANDRIA',
        name: 'Alexandria',
        code: 'EGALY',
        country: 'Egypt',
        region: 'Alexandria',
        latitude: 31.2001,
        longitude: 29.9187,
        UNLOCODE: 'EGALY',
        type: 'SEA',
        size: 'MEDIUM',
        draught: 12,
        containersCapacity: 1000000,
        berths: ['Berth A', 'Berth B'],
        facilities: ['Container Terminal', 'Bulk Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'Africa/Cairo'
      },
      {
        id: 'PORT_DJIBOUTI',
        name: 'Djibouti',
        code: 'DJJIB',
        country: 'Djibouti',
        region: 'Djibouti',
        latitude: 11.5950,
        longitude: 43.1481,
        UNLOCODE: 'DJJIB',
        type: 'SEA',
        size: 'MEDIUM',
        draught: 11,
        containersCapacity: 800000,
        berths: ['Berth 1', 'Berth 2'],
        facilities: ['Container Terminal', 'Bulk Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'Africa/Djibouti'
      },
      {
        id: 'PORT_BANDAR_ABBAS',
        name: 'Bandar Abbas',
        code: 'IRBND',
        country: 'Iran',
        region: 'Hormozgan',
        latitude: 27.2000,
        longitude: 56.2667,
        UNLOCODE: 'IRBND',
        type: 'SEA',
        size: 'MEDIUM',
        draught: 12,
        containersCapacity: 900000,
        berths: ['Berth A', 'Berth B'],
        facilities: ['Container Terminal', 'Oil Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'Asia/Tehran'
      },
      {
        id: 'PORT_JEBEL_ALI',
        name: 'Jebel Ali',
        code: 'AEJEA',
        country: 'United Arab Emirates',
        region: 'Dubai',
        latitude: 25.0267,
        longitude: 55.0781,
        UNLOCODE: 'AEJEA',
        type: 'SEA',
        size: 'LARGE',
        draught: 17,
        containersCapacity: 15000000,
        berths: ['Berth 1', 'Berth 2', 'Berth 3', 'Berth 4'],
        facilities: ['Container Terminal', 'Bulk Terminal', 'Liquid Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'Asia/Dubai'
      },
      {
        id: 'PORT_SAINT_PETERSBURG',
        name: 'Saint Petersburg',
        code: 'RULED',
        country: 'Russia',
        region: 'Saint Petersburg',
        latitude: 59.9343,
        longitude: 30.3351,
        UNLOCODE: 'RULED',
        type: 'SEA',
        size: 'LARGE',
        draught: 14,
        containersCapacity: 2000000,
        berths: ['Berth A', 'Berth B', 'Berth C'],
        facilities: ['Container Terminal', 'Bulk Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'Europe/Moscow'
      },
      // CPLP (5 ports)
      {
        id: 'PORT_LISBOA',
        name: 'Lisboa',
        code: 'PTLIS',
        country: 'Portugal',
        region: 'Lisbon',
        latitude: 38.7223,
        longitude: -9.1393,
        UNLOCODE: 'PTLIS',
        type: 'SEA',
        size: 'LARGE',
        draught: 15,
        containersCapacity: 2500000,
        berths: ['Berth 1', 'Berth 2', 'Berth 3'],
        facilities: ['Container Terminal', 'Bulk Terminal', 'Liquid Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'Europe/Lisbon'
      },
      {
        id: 'PORT_LUANDA',
        name: 'Luanda',
        code: 'AOLAD',
        country: 'Angola',
        region: 'Luanda',
        latitude: -8.8383,
        longitude: 13.2344,
        UNLOCODE: 'AOLAD',
        type: 'SEA',
        size: 'LARGE',
        draught: 14,
        containersCapacity: 1500000,
        berths: ['Berth A', 'Berth B'],
        facilities: ['Container Terminal', 'Oil Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'Africa/Luanda'
      },
      {
        id: 'PORT_MAPUTO',
        name: 'Maputo',
        code: 'MZMPM',
        country: 'Mozambique',
        region: 'Maputo',
        latitude: -25.9686,
        longitude: 32.5745,
        UNLOCODE: 'MZMPM',
        type: 'SEA',
        size: 'MEDIUM',
        draught: 12,
        containersCapacity: 600000,
        berths: ['Berth 1', 'Berth 2'],
        facilities: ['Container Terminal', 'Bulk Terminal'],
        customsIntegration: true,
        operationalHours: '24/7',
        timezone: 'Africa/Maputo'
      },
      {
        id: 'PORT_MINDELO',
        name: 'Mindelo',
        code: 'CVMIN',
        country: 'Cape Verde',
        region: 'Sao Vicente',
        latitude: 16.8781,
        longitude: -25.0116,
        UNLOCODE: 'CVMIN',
        type: 'SEA',
        size: 'SMALL',
        draught: 9,
        containersCapacity: 100000,
        berths: ['Berth 1'],
        facilities: ['Container Terminal'],
        customsIntegration: true,
        operationalHours: '08:00-18:00',
        timezone: 'Atlantic/Cape_Verde'
      },
      {
        id: 'PORT_DILI',
        name: 'Dili',
        code: 'TLDIL',
        country: 'Timor-Leste',
        region: 'Dili',
        latitude: -8.5586,
        longitude: 125.5785,
        UNLOCODE: 'TLDIL',
        type: 'SEA',
        size: 'SMALL',
        draught: 8,
        containersCapacity: 50000,
        berths: ['Berth 1'],
        facilities: ['Container Terminal'],
        customsIntegration: true,
        operationalHours: '08:00-17:00',
        timezone: 'Asia/Dili'
      }
    ];

    samplePorts.forEach(data => {
      const port = new Port(data);
      this.ports.set(port.id, port);
    });
  }

  getAllPorts() {
    return Array.from(this.ports.values()).map(p => p.toJSON());
  }

  getPort(portId) {
    return this.ports.get(portId);
  }

  getPortsByCountry(country) {
    return Array.from(this.ports.values())
      .filter(p => p.country === country)
      .map(p => p.toJSON());
  }

  getPortsByBlock(block) {
    return Array.from(this.ports.values())
      .filter(p => p.block === block)
      .map(p => p.toJSON());
  }

  getPortsByRegion(region) {
    return Array.from(this.ports.values())
      .filter(p => p.region === region)
      .map(p => p.toJSON());
  }

  addPort(portData) {
    const port = new Port(portData);
    this.ports.set(port.id, port);
    return port;
  }

  updatePort(portId, updates) {
    const port = this.ports.get(portId);
    if (!port) return null;
    
    Object.assign(port, updates);
    return port;
  }

  removePort(portId) {
    this.ports.delete(portId);
    return true;
  }

  filterPorts(filters) {
    let ports = Array.from(this.ports.values());
    
    if (filters.country) {
      ports = ports.filter(p => p.country === filters.country);
    }
    
    if (filters.region) {
      ports = ports.filter(p => p.region === filters.region);
    }
    
    if (filters.block) {
      ports = ports.filter(p => p.block === filters.block);
    }
    
    if (filters.size) {
      ports = ports.filter(p => p.size === filters.size);
    }
    
    if (filters.type) {
      ports = ports.filter(p => p.type === filters.type);
    }
    
    if (filters.customsIntegration) {
      ports = ports.filter(p => p.customsIntegration === filters.customsIntegration);
    }
    
    return ports.map(p => p.toJSON());
  }

  getPortStatistics() {
    const ports = Array.from(this.ports.values());
    
    return {
      total: ports.length,
      byCountry: this.countBy(ports, 'country'),
      byBlock: this.countBy(ports, 'block'),
      bySize: this.countBy(ports, 'size'),
      byType: this.countBy(ports, 'type'),
      withCustoms: ports.filter(p => p.customsIntegration).length,
      totalCapacity: ports.reduce((sum, p) => sum + p.containersCapacity, 0)
    };
  }

  countBy(array, property) {
    const counts = {};
    array.forEach(item => {
      const value = item[property];
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }

  // Real-time operations
  addVesselToPort(portId, vesselId) {
    const port = this.ports.get(portId);
    if (!port) return false;
    
    port.addVesselInPort(vesselId);
    return true;
  }

  removeVesselFromPort(portId, vesselId) {
    const port = this.ports.get(portId);
    if (!port) return false;
    
    port.removeVesselFromPort(vesselId);
    return true;
  }

  addVesselToQueue(portId, vesselId) {
    const port = this.ports.get(portId);
    if (!port) return false;
    
    port.addQueuedVessel(vesselId);
    return true;
  }

  removeVesselFromQueue(portId, vesselId) {
    const port = this.ports.get(portId);
    if (!port) return false;
    
    port.removeQueuedVessel(vesselId);
    return true;
  }

  updateWaitingTime(portId, waitingTime) {
    const port = this.ports.get(portId);
    if (!port) return false;
    
    port.updateWaitingTime(waitingTime);
    return true;
  }
}

module.exports = new PortService();
