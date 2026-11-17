class Vessel {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.imo = data.imo || null;
    this.mmsi = data.mmsi || null;
    this.flag = data.flag || '';
    this.vesselType = data.vesselType || '';
    this.length = data.length || 0;
    this.width = data.width || 0;
    this.draught = data.draught || 0;
    this.grossTonnage = data.grossTonnage || 0;
    this.deadweight = data.deadweight || 0;
    
    // Position data
    this.latitude = data.latitude || 0;
    this.longitude = data.longitude || 0;
    this.speed = data.speed || 0;
    this.course = data.course || 0;
    this.heading = data.heading || 0;
    this.timestamp = data.timestamp || new Date().toISOString();
    
    // Route data
    this.currentRouteId = data.currentRouteId || null;
    this.originPortId = data.originPortId || null;
    this.destinationPortId = data.destinationPortId || null;
    this.estimatedArrival = data.estimatedArrival || null;
    this.departureTime = data.departureTime || null;
    
    // Cargo data
    this.cargo = data.cargo || [];
    this.totalContainers = data.totalContainers || 0;
    this.totalWeight = data.totalWeight || 0;
    
    // Status
    this.status = data.status || 'AT_SEA';
    this.lastUpdate = data.lastUpdate || new Date().toISOString();
    
    // Contract data
    this.contractId = data.contractId || null;
    this.contractType = data.contractType || null;
    this.cbs = data.cbs || 0;
    this.ibs = data.ibs || 0;
    this.importTax = data.importTax || 0;
    
    // Tracking hash
    this.trackingHash = data.trackingHash || this.generateTrackingHash();
  }

  generateId() {
    return 'VSL_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  generateTrackingHash() {
    const crypto = require('crypto');
    const data = `${this.id}${this.name}${this.imo}${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substr(0, 16);
  }

  updatePosition(latitude, longitude, speed, course, heading, timestamp) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.speed = speed || this.speed;
    this.course = course || this.course;
    this.heading = heading || this.heading;
    this.timestamp = timestamp || new Date().toISOString();
    this.lastUpdate = new Date().toISOString();
    
    // Update status based on speed
    if (speed === 0 || speed === null) {
      this.status = 'ANCHORED';
    } else if (speed < 0.1) {
      this.status = 'MOORED';
    } else {
      this.status = 'AT_SEA';
    }
  }

  calculateDistanceToRoute(route) {
    // Simplified distance calculation (Haversine formula)
    const toRadians = (degrees) => degrees * Math.PI / 180;
    
    const lat1 = toRadians(this.latitude);
    const lon1 = toRadians(this.longitude);
    
    // Find closest point on route
    let minDistance = Infinity;
    for (let i = 0; i < route.waypoints.length - 1; i++) {
      const wp1 = route.waypoints[i];
      const wp2 = route.waypoints[i + 1];
      
      const lat2 = toRadians(wp1.latitude);
      const lon2 = toRadians(wp1.longitude);
      const lat3 = toRadians(wp2.latitude);
      const lon3 = toRadians(wp2.longitude);
      
      // Calculate distance from vessel to line segment
      const distance = this.calculateDistanceToSegment(
        lat1, lon1, lat2, lon2, lat3, lon3
      );
      
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    
    return minDistance * 6371; // Convert to meters, then to nautical miles
  }

  calculateDistanceToSegment(lat1, lon1, lat2, lon2, lat3, lon3) {
    // Calculate distance from point (lat1,lon1) to line segment (lat2,lon2)-(lat3,lon3)
    // Using spherical geometry approximation
    const R = 6371; // Earth radius in km
    
    const dLat21 = lat2 - lat1;
    const dLon21 = lon2 - lon1;
    const dLat31 = lat3 - lat1;
    const dLon31 = lon3 - lon1;
    
    const a = Math.sin(dLat21) * Math.sin(dLat21) + 
              Math.cos(lat1) * Math.cos(lat2) * 
              Math.sin(dLon21) * Math.sin(dLon21);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist21 = R * c;
    
    const a3 = Math.sin(dLat31) * Math.sin(dLat31) + 
                Math.cos(lat1) * Math.cos(lat3) * 
                Math.sin(dLon31) * Math.sin(dLon31);
    const c3 = 2 * Math.atan2(Math.sqrt(a3), Math.sqrt(1 - a3));
    const dist31 = R * c3;
    
    const a23 = Math.sin(lat3 - lat2) * Math.sin(lat3 - lat2) + 
                Math.cos(lat2) * Math.cos(lat3) * 
                Math.sin(lon3 - lon2) * Math.sin(lon3 - lon2);
    const c23 = 2 * Math.atan2(Math.sqrt(a23), Math.sqrt(1 - a23));
    const dist23 = R * c23;
    
    // Semi-perimeter
    const s = (dist21 + dist31 + dist23) / 2;
    
    // Area of triangle
    const area = Math.sqrt(s * (s - dist21) * (s - dist31) * (s - dist23));
    
    // Distance from point to line
    const distance = (2 * area) / dist23;
    
    return distance;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      imo: this.imo,
      mmsi: this.mmsi,
      flag: this.flag,
      vesselType: this.vesselType,
      length: this.length,
      width: this.width,
      draught: this.draught,
      grossTonnage: this.grossTonnage,
      deadweight: this.deadweight,
      latitude: this.latitude,
      longitude: this.longitude,
      speed: this.speed,
      course: this.course,
      heading: this.heading,
      timestamp: this.timestamp,
      currentRouteId: this.currentRouteId,
      originPortId: this.originPortId,
      destinationPortId: this.destinationPortId,
      estimatedArrival: this.estimatedArrival,
      departureTime: this.departureTime,
      cargo: this.cargo,
      totalContainers: this.totalContainers,
      totalWeight: this.totalWeight,
      status: this.status,
      lastUpdate: this.lastUpdate,
      contractId: this.contractId,
      contractType: this.contractType,
      cbs: this.cbs,
      ibs: this.ibs,
      importTax: this.importTax,
      trackingHash: this.trackingHash
    };
  }
}

module.exports = Vessel;
