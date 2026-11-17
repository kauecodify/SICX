class Port {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.code = data.code || '';
    this.country = data.country || '';
    this.region = data.region || '';
    this.latitude = data.latitude || 0;
    this.longitude = data.longitude || 0;
    this.UNLOCODE = data.UNLOCODE || '';
    this.type = data.type || 'SEA';
    this.size = data.size || 'LARGE';
    this.draught = data.draught || 0;
    this.containersCapacity = data.containersCapacity || 0;
    this.berths = data.berths || [];
    this.facilities = data.facilities || [];
    this.customsIntegration = data.customsIntegration || false;
    this.operationalHours = data.operationalHours || '24/7';
    this.timezone = data.timezone || '';
    
    // Real-time data
    this.vesselsInPort = data.vesselsInPort || [];
    this.queuedVessels = data.queuedVessels || [];
    this.estimatedWaitingTime = data.estimatedWaitingTime || 0;
    this.lastUpdate = data.lastUpdate || new Date().toISOString();
    
    // Block classification
    this.block = this.determineBlock();
  }

  generateId() {
    return 'PORT_' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  determineBlock() {
    const brazilPorts = ['Santos', 'Paranagua', 'Rio Grande', 'Suape', 'Itaqui', 'Vitoria', 'Salvador', 'Manaus', 'Belem', 'Rio de Janeiro'];
    const mercosulPorts = ['Buenos Aires', 'Montevideo', 'Asuncion', 'Iquique'];
    const bricsPorts = ['Shanghai', 'Mumbai', 'Durban', 'Alexandria', 'Djibouti', 'Bandar Abbas', 'Jebel Ali', 'Saint Petersburg'];
    const cplpPorts = ['Lisboa', 'Luanda', 'Maputo', 'Mindelo', 'Dili'];
    
    if (brazilPorts.includes(this.name)) {
      return 'BRASIL';
    } else if (mercosulPorts.includes(this.name)) {
      return 'MERCOSUL';
    } else if (bricsPorts.includes(this.name)) {
      return 'BRICS';
    } else if (cplpPorts.includes(this.name)) {
      return 'CPLP';
    }
    return 'OUTROS';
  }

  addVesselInPort(vesselId) {
    if (!this.vesselsInPort.includes(vesselId)) {
      this.vesselsInPort.push(vesselId);
      this.lastUpdate = new Date().toISOString();
    }
  }

  removeVesselFromPort(vesselId) {
    this.vesselsInPort = this.vesselsInPort.filter(id => id !== vesselId);
    this.lastUpdate = new Date().toISOString();
  }

  addQueuedVessel(vesselId) {
    if (!this.queuedVessels.includes(vesselId)) {
      this.queuedVessels.push(vesselId);
      this.lastUpdate = new Date().toISOString();
    }
  }

  removeQueuedVessel(vesselId) {
    this.queuedVessels = this.queuedVessels.filter(id => id !== vesselId);
    this.lastUpdate = new Date().toISOString();
  }

  updateWaitingTime(waitingTime) {
    this.estimatedWaitingTime = waitingTime;
    this.lastUpdate = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      country: this.country,
      region: this.region,
      latitude: this.latitude,
      longitude: this.longitude,
      UNLOCODE: this.UNLOCODE,
      type: this.type,
      size: this.size,
      draught: this.draught,
      containersCapacity: this.containersCapacity,
      berths: this.berths,
      facilities: this.facilities,
      customsIntegration: this.customsIntegration,
      operationalHours: this.operationalHours,
      timezone: this.timezone,
      vesselsInPort: this.vesselsInPort,
      queuedVessels: this.queuedVessels,
      estimatedWaitingTime: this.estimatedWaitingTime,
      lastUpdate: this.lastUpdate,
      block: this.block
    };
  }
}

module.exports = Port;
