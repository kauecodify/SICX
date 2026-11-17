class Alert {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.vesselId = data.vesselId || '';
    this.vesselName = data.vesselName || '';
    this.type = data.type || ''; // DEVIATION, STOP, DOCUMENTATION, etc.
    this.severity = data.severity || 'MEDIUM'; // LOW, MEDIUM, HIGH, CRITICAL
    this.message = data.message || '';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.details = data.details || {};
    
    // RedFlag specific data
    this.redFlagCode = data.redFlagCode || this.generateRedFlagCode();
    this.requiresApproval = data.requiresApproval || false;
    this.playbook = data.playbook || null;
    this.responsible = data.responsible || null;
    this.sla = data.sla || null; // in minutes
    this.status = data.status || 'ACTIVE'; // ACTIVE, ACKNOWLEDGED, RESOLVED
    
    // Location data
    this.latitude = data.latitude || 0;
    this.longitude = data.longitude || 0;
    
    // Resolution data
    this.resolvedAt = data.resolvedAt || null;
    this.resolvedBy = data.resolvedBy || null;
    this.resolutionNotes = data.resolutionNotes || '';
    
    // Audit data
    this.createdBy = data.createdBy || 'SYSTEM';
    this.lastUpdate = data.lastUpdate || new Date().toISOString();
    this.auditTrail = data.auditTrail || [];
    
    // ICP-Brasil timestamp
    this.icpTimestamp = data.icpTimestamp || this.generateICPTimestamp();
  }

  generateId() {
    return 'ALERT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  generateRedFlagCode() {
    const codes = ['RF-DEV', 'RF-STOP', 'RF-DOC', 'RF-SEC', 'RF-CUST', 'RF-TAX', 'RF-CONT'];
    return codes[Math.floor(Math.random() * codes.length)] + '-' + Date.now().toString(36).substr(-4).toUpperCase();
  }

  generateICPTimestamp() {
    return new Date().toISOString();
  }

  addToAuditTrail(action, user, notes = '') {
    this.auditTrail.push({
      timestamp: new Date().toISOString(),
      action,
      user,
      notes
    });
    this.lastUpdate = new Date().toISOString();
  }

  acknowledge(user) {
    this.status = 'ACKNOWLEDGED';
    this.addToAuditTrail('ACKNOWLEDGE', user, 'Alert acknowledged');
  }

  resolve(user, notes) {
    this.status = 'RESOLVED';
    this.resolvedAt = new Date().toISOString();
    this.resolvedBy = user;
    this.resolutionNotes = notes;
    this.addToAuditTrail('RESOLVE', user, notes);
  }

  toJSON() {
    return {
      id: this.id,
      vesselId: this.vesselId,
      vesselName: this.vesselName,
      type: this.type,
      severity: this.severity,
      message: this.message,
      timestamp: this.timestamp,
      details: this.details,
      redFlagCode: this.redFlagCode,
      requiresApproval: this.requiresApproval,
      playbook: this.playbook,
      responsible: this.responsible,
      sla: this.sla,
      status: this.status,
      latitude: this.latitude,
      longitude: this.longitude,
      resolvedAt: this.resolvedAt,
      resolvedBy: this.resolvedBy,
      resolutionNotes: this.resolutionNotes,
      createdBy: this.createdBy,
      lastUpdate: this.lastUpdate,
      auditTrail: this.auditTrail,
      icpTimestamp: this.icpTimestamp
    };
  }
}

// Alert types
Alert.TYPE = {
  DEVIATION: 'DEVIATION',
  UNAUTHORIZED_STOP: 'UNAUTHORIZED_STOP',
  DOCUMENTATION_ISSUE: 'DOCUMENTATION_ISSUE',
  CUSTOMS_ALERT: 'CUSTOMS_ALERT',
  TAX_DISCREPANCY: 'TAX_DISCREPANCY',
  CONTAINER_ISSUE: 'CONTAINER_ISSUE',
  SECURITY_THREAT: 'SECURITY_THREAT'
};

// Severity levels
Alert.SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Playbook mappings
Alert.PLAYBOOKS = {
  DEVIATION: 'PB-01',
  UNAUTHORIZED_STOP: 'PB-02',
  DOCUMENTATION_ISSUE: 'PB-03',
  CUSTOMS_ALERT: 'PB-04',
  TAX_DISCREPANCY: 'PB-05',
  CONTAINER_ISSUE: 'PB-06',
  SECURITY_THREAT: 'PB-07'
};

module.exports = Alert;
