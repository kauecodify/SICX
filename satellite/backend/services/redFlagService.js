const Alert = require('../models/Alert');
const config = require('../config/default.json');

class RedFlagService {
  constructor() {
    this.alerts = new Map();
    this.subscribers = new Set();
    this.thresholdDistance = config.redFlag.thresholdDistance; // nautical miles
    this.thresholdStopTime = config.redFlag.thresholdStopTime; // milliseconds
    this.autoApprove = config.redFlag.autoApprove;
    this.loadInitialAlerts();
  }

  loadInitialAlerts() {
    // Load existing alerts from storage
    try {
      const fs = require('fs');
      const path = require('path');
      const alertsPath = path.join(__dirname, '../../data/alerts.jsonl');
      
      if (fs.existsSync(alertsPath)) {
        const lines = fs.readFileSync(alertsPath, 'utf8').split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              const alert = new Alert(data);
              this.alerts.set(alert.id, alert);
            } catch (error) {
              console.error('Error parsing alert:', error);
            }
          }
        });
      }
    } catch (error) {
      console.log('No existing alerts found');
    }
  }

  checkVesselForAlerts(vessel) {
    const alerts = [];
    
    // Check for route deviation
    if (vessel.currentRouteId && vessel.latitude && vessel.longitude) {
      const route = this.getRouteForVessel(vessel);
      if (route) {
        const deviation = route.getDeviation(vessel);
        if (deviation > this.thresholdDistance) {
          alerts.push(this.createDeviationAlert(vessel, deviation, route));
        }
      }
    }
    
    // Check for unauthorized stop
    if (vessel.speed === 0 && vessel.status !== 'ANCHORED' && vessel.status !== 'MOORED') {
      const lastPosition = this.getLastPosition(vessel);
      if (lastPosition) {
        const stopDuration = Date.now() - new Date(lastPosition.timestamp).getTime();
        if (stopDuration > this.thresholdStopTime) {
          alerts.push(this.createStopAlert(vessel, stopDuration));
        }
      }
    }
    
    // Check for documentation issues
    if (!vessel.imo || !vessel.mmsi || !vessel.flag) {
      alerts.push(this.createDocumentationAlert(vessel));
    }
    
    // Check for high-value cargo
    if (vessel.totalWeight > 1000000) { // 1 million kg
      alerts.push(this.createHighValueAlert(vessel));
    }
    
    return alerts;
  }

  createDeviationAlert(vessel, deviation, route) {
    const alert = new Alert({
      vesselId: vessel.id,
      vesselName: vessel.name,
      type: Alert.TYPE.DEVIATION,
      severity: deviation > this.thresholdDistance * 2 ? Alert.SEVERITY.HIGH : Alert.SEVERITY.MEDIUM,
      message: `Vessel ${vessel.name} deviated ${deviation.toFixed(2)}nm from route ${route.name}`,
      details: {
        deviation: deviation,
        routeId: route.id,
        routeName: route.name,
        expectedPosition: this.calculateExpectedPosition(vessel, route),
        threshold: this.thresholdDistance
      },
      latitude: vessel.latitude,
      longitude: vessel.longitude,
      requiresApproval: true,
      playbook: Alert.PLAYBOOKS.DEVIATION,
      responsible: 'OPERATIONS_TEAM',
      sla: 30 // minutes
    });
    
    this.alerts.set(alert.id, alert);
    this.saveAlert(alert);
    this.notifySubscribers(alert);
    
    return alert;
  }

  createStopAlert(vessel, stopDuration) {
    const hours = stopDuration / (1000 * 60 * 60);
    
    const alert = new Alert({
      vesselId: vessel.id,
      vesselName: vessel.name,
      type: Alert.TYPE.UNAUTHORIZED_STOP,
      severity: hours > 24 ? Alert.SEVERITY.HIGH : Alert.SEVERITY.MEDIUM,
      message: `Vessel ${vessel.name} stopped for ${hours.toFixed(2)} hours without authorization`,
      details: {
        stopDuration: stopDuration,
        stopDurationHours: hours,
        position: { latitude: vessel.latitude, longitude: vessel.longitude }
      },
      latitude: vessel.latitude,
      longitude: vessel.longitude,
      requiresApproval: true,
      playbook: Alert.PLAYBOOKS.UNAUTHORIZED_STOP,
      responsible: 'SECURITY_TEAM',
      sla: 60 // minutes
    });
    
    this.alerts.set(alert.id, alert);
    this.saveAlert(alert);
    this.notifySubscribers(alert);
    
    return alert;
  }

  createDocumentationAlert(vessel) {
    const missingFields = [];
    if (!vessel.imo) missingFields.push('IMO');
    if (!vessel.mmsi) missingFields.push('MMSI');
    if (!vessel.flag) missingFields.push('Flag');
    
    const alert = new Alert({
      vesselId: vessel.id,
      vesselName: vessel.name,
      type: Alert.TYPE.DOCUMENTATION_ISSUE,
      severity: Alert.SEVERITY.MEDIUM,
      message: `Vessel ${vessel.name} has missing documentation: ${missingFields.join(', ')}`,
      details: {
        missingFields: missingFields
      },
      latitude: vessel.latitude,
      longitude: vessel.longitude,
      requiresApproval: false,
      playbook: Alert.PLAYBOOKS.DOCUMENTATION_ISSUE,
      responsible: 'COMPLIANCE_TEAM',
      sla: 120 // minutes
    });
    
    this.alerts.set(alert.id, alert);
    this.saveAlert(alert);
    this.notifySubscribers(alert);
    
    return alert;
  }

  createHighValueAlert(vessel) {
    const alert = new Alert({
      vesselId: vessel.id,
      vesselName: vessel.name,
      type: Alert.TYPE.CONTAINER_ISSUE,
      severity: Alert.SEVERITY.HIGH,
      message: `High-value cargo on vessel ${vessel.name}: ${vessel.totalWeight}kg`,
      details: {
        totalWeight: vessel.totalWeight,
        totalContainers: vessel.totalContainers,
        cargo: vessel.cargo
      },
      latitude: vessel.latitude,
      longitude: vessel.longitude,
      requiresApproval: true,
      playbook: Alert.PLAYBOOKS.CONTAINER_ISSUE,
      responsible: 'CUSTOMS_TEAM',
      sla: 15 // minutes
    });
    
    this.alerts.set(alert.id, alert);
    this.saveAlert(alert);
    this.notifySubscribers(alert);
    
    return alert;
  }

  getRouteForVessel(vessel) {
    // In a real implementation, this would look up the route from the route service
    // For now, return a mock route
    return {
      id: vessel.currentRouteId,
      name: `Route ${vessel.originPortId} to ${vessel.destinationPortId}`,
      waypoints: [
        { latitude: -23.5505, longitude: -46.6333 },
        { latitude: -30, longitude: -40 },
        { latitude: 30, longitude: 120 }
      ],
      getDeviation: (v) => {
        // Simple distance calculation for demo
        const toRadians = (degrees) => degrees * Math.PI / 180;
        const lat1 = toRadians(v.latitude);
        const lon1 = toRadians(v.longitude);
        const lat2 = toRadians(-23.5505);
        const lon2 = toRadians(-46.6333);
        
        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = 6371 * c;
        const distanceNm = distanceKm / 1.852;
        
        return distanceNm;
      }
    };
  }

  getLastPosition(vessel) {
    // In a real implementation, this would get the last position from storage
    return {
      latitude: vessel.latitude,
      longitude: vessel.longitude,
      timestamp: vessel.timestamp
    };
  }

  calculateExpectedPosition(vessel, route) {
    // Calculate expected position based on route and time
    // This is a simplified version
    return {
      latitude: route.waypoints[0].latitude,
      longitude: route.waypoints[0].longitude
    };
  }

  getAllAlerts() {
    return Array.from(this.alerts.values()).map(a => a.toJSON());
  }

  getActiveAlerts() {
    return Array.from(this.alerts.values())
      .filter(a => a.status === 'ACTIVE')
      .map(a => a.toJSON());
  }

  getAlert(alertId) {
    return this.alerts.get(alertId);
  }

  getAlertsForVessel(vesselId) {
    return Array.from(this.alerts.values())
      .filter(a => a.vesselId === vesselId)
      .map(a => a.toJSON());
  }

  createAlert(alertData) {
    const alert = new Alert(alertData);
    this.alerts.set(alert.id, alert);
    this.saveAlert(alert);
    this.notifySubscribers(alert);
    return alert;
  }

  updateAlert(alertId, updates) {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;
    
    Object.assign(alert, updates);
    this.saveAlert(alert);
    this.notifySubscribers(alert);
    return alert;
  }

  acknowledgeAlert(alertId, user) {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;
    
    alert.acknowledge(user);
    this.saveAlert(alert);
    this.notifySubscribers(alert);
    return alert;
  }

  resolveAlert(alertId, user, notes) {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;
    
    alert.resolve(user, notes);
    this.saveAlert(alert);
    this.notifySubscribers(alert);
    return alert;
  }

  deleteAlert(alertId) {
    this.alerts.delete(alertId);
    return true;
  }

  saveAlert(alert) {
    try {
      const fs = require('fs');
      const path = require('path');
      const alertsPath = path.join(__dirname, '../../data/alerts.jsonl');
      
      // Ensure directory exists
      const dir = path.dirname(alertsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Append to file (append-only for audit trail)
      fs.appendFileSync(alertsPath, JSON.stringify(alert.toJSON()) + '\n');
    } catch (error) {
      console.error('Error saving alert:', error);
    }
  }

  subscribeToAlerts(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(alert) {
    this.subscribers.forEach(callback => {
      try {
        callback(alert.toJSON());
      } catch (error) {
        console.error('Error in alert subscriber:', error);
      }
    });
  }

  filterAlerts(filters) {
    let alerts = Array.from(this.alerts.values());
    
    if (filters.type) {
      alerts = alerts.filter(a => a.type === filters.type);
    }
    
    if (filters.severity) {
      alerts = alerts.filter(a => a.severity === filters.severity);
    }
    
    if (filters.status) {
      alerts = alerts.filter(a => a.status === filters.status);
    }
    
    if (filters.vesselId) {
      alerts = alerts.filter(a => a.vesselId === filters.vesselId);
    }
    
    if (filters.requiresApproval) {
      alerts = alerts.filter(a => a.requiresApproval === filters.requiresApproval);
    }
    
    if (filters.startDate) {
      alerts = alerts.filter(a => new Date(a.timestamp) >= new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      alerts = alerts.filter(a => new Date(a.timestamp) <= new Date(filters.endDate));
    }
    
    return alerts.map(a => a.toJSON());
  }

  getAlertStatistics() {
    const alerts = Array.from(this.alerts.values());
    
    return {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'ACTIVE').length,
      acknowledged: alerts.filter(a => a.status === 'ACKNOWLEDGED').length,
      resolved: alerts.filter(a => a.status === 'RESOLVED').length,
      byType: this.countBy(alerts, 'type'),
      bySeverity: this.countBy(alerts, 'severity'),
      byStatus: this.countBy(alerts, 'status'),
      requiresApproval: alerts.filter(a => a.requiresApproval).length
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
}

module.exports = new RedFlagService();
