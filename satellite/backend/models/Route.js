class Route {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.originPortId = data.originPortId || '';
    this.destinationPortId = data.destinationPortId || '';
    this.distance = data.distance || 0; // in nautical miles
    this.duration = data.duration || 0; // in hours
    this.waypoints = data.waypoints || [];
    this.maxDraught = data.maxDraught || 0;
    this.recommendedSpeed = data.recommendedSpeed || 0;
    this.fuelConsumption = data.fuelConsumption || 0;
    this.tolls = data.tolls || [];
    this.restrictedAreas = data.restrictedAreas || [];
    this.weatherConditions = data.weatherConditions || {};
    
    // Block classification
    this.block = this.determineBlock();
    
    // Tax information
    this.importTaxRate = this.calculateImportTaxRate();
  }

  generateId() {
    return 'RTE_' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  determineBlock() {
    // This will be set based on origin and destination ports
    return 'INTERNATIONAL';
  }

  calculateImportTaxRate() {
    // Tax rates based on port blocks
    const mercosulPorts = ['Buenos Aires', 'Montevideo', 'Asuncion', 'Iquique'];
    const bricsPorts = ['Shanghai', 'Mumbai', 'Durban', 'Alexandria', 'Djibouti', 'Bandar Abbas', 'Jebel Ali', 'Saint Petersburg'];
    const cplpPorts = ['Lisboa', 'Luanda', 'Maputo', 'Mindelo', 'Dili'];
    
    // Get port names (simplified - in real implementation, we'd look up port details)
    const getPortName = (portId) => {
      return portId.split('_').pop();
    };
    
    const originPort = getPortName(this.originPortId);
    const destinationPort = getPortName(this.destinationPortId);
    
    // Check if destination is in specific blocks
    if (mercosulPorts.some(p => destinationPort.includes(p))) {
      return 0.00; // Mercosul: 0%
    } else if (bricsPorts.some(p => destinationPort.includes(p)) || 
               cplpPorts.some(p => destinationPort.includes(p))) {
      return 0.10; // BRICS/CPLP: 10%
    }
    
    return 0.20; // Others: 20%
  }

  addWaypoint(latitude, longitude, description = '') {
    this.waypoints.push({
      latitude,
      longitude,
      description,
      index: this.waypoints.length
    });
    this.recalculateDistance();
  }

  recalculateDistance() {
    // Calculate total distance based on waypoints
    let totalDistance = 0;
    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const wp1 = this.waypoints[i];
      const wp2 = this.waypoints[i + 1];
      totalDistance += this.calculateHaversineDistance(
        wp1.latitude, wp1.longitude,
        wp2.latitude, wp2.longitude
      );
    }
    this.distance = totalDistance;
  }

  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const toRadians = (degrees) => degrees * Math.PI / 180;
    
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    
    // Convert to nautical miles (1 nm = 1.852 km)
    return distanceKm / 1.852;
  }

  isOnRoute(vessel) {
    // Check if vessel is within acceptable distance from route
    const maxDeviation = 50; // nautical miles
    const distance = vessel.calculateDistanceToRoute(this);
    return distance <= maxDeviation;
  }

  getDeviation(vessel) {
    return vessel.calculateDistanceToRoute(this);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      originPortId: this.originPortId,
      destinationPortId: this.destinationPortId,
      distance: this.distance,
      duration: this.duration,
      waypoints: this.waypoints,
      maxDraught: this.maxDraught,
      recommendedSpeed: this.recommendedSpeed,
      fuelConsumption: this.fuelConsumption,
      tolls: this.tolls,
      restrictedAreas: this.restrictedAreas,
      weatherConditions: this.weatherConditions,
      block: this.block,
      importTaxRate: this.importTaxRate
    };
  }
}

module.exports = Route;
