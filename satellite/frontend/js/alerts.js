// SICX Satellite Tracking - Alerts Module

class AlertsModule {
    static init(data) {
        this.data = data;
        this.tableBody = document.getElementById('alertsTableBody');
        this.refreshBtn = document.getElementById('refreshAlertsBtn');
        this.typeFilter = document.getElementById('alertTypeFilter');
        this.severityFilter = document.getElementById('alertSeverityFilter');
        this.statusFilter = document.getElementById('alertStatusFilter');
        
        this.setupEventListeners();
        this.renderTable();
        
        // Subscribe to data updates
        if (window.App) {
            window.App.subscribe('alerts', (alerts) => {
                this.data.alerts = alerts;
                this.renderTable();
            });
        }
    }
    
    static setupEventListeners() {
        // Refresh button
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                if (window.App) {
                    window.App.refreshAllData();
                }
            });
        }
        
        // Filters
        if (this.typeFilter) {
            this.typeFilter.addEventListener('change', () => this.filterAndRender());
        }
        if (this.severityFilter) {
            this.severityFilter.addEventListener('change', () => this.filterAndRender());
        }
        if (this.statusFilter) {
            this.statusFilter.addEventListener('change', () => this.filterAndRender());
        }
    }
    
    static filterAndRender() {
        const type = this.typeFilter?.value || '';
        const severity = this.severityFilter?.value || '';
        const status = this.statusFilter?.value || '';
        
        const filtered = this.data.alerts.filter(alert => {
            const matchesType = !type || alert.type === type;
            const matchesSeverity = !severity || alert.severity === severity;
            const matchesStatus = !status || alert.status === status;
            
            return matchesType && matchesSeverity && matchesStatus;
        });
        
        this.renderTable(filtered);
    }
    
    static renderTable(alerts = this.data.alerts) {
        if (!this.tableBody) return;
        
        const rows = alerts.map(alert => {
            const vessel = this.data.vessels.find(v => v.id === alert.vesselId);
            const vesselName = vessel?.name || alert.vesselName || alert.vesselId || 'N/A';
            
            return `
                <tr data-alert-id="${alert.id}">
                    <td>${alert.id}</td>
                    <td>${vesselName}</td>
                    <td>${this.getAlertTypeLabel(alert.type)}</td>
                    <td><span class="severity-badge ${alert.severity?.toLowerCase()}">${this.getSeverityLabel(alert.severity)}</span></td>
                    <td>${alert.message}</td>
                    <td>${new Date(alert.timestamp).toLocaleString('pt-BR')}</td>
                    <td><span class="status-badge ${alert.status?.toLowerCase()}">${this.getStatusLabel(alert.status)}</span></td>
                    <td>${alert.playbook || 'N/A'}</td>
                    <td>
                        ${alert.status === 'ACTIVE' ? `
                            <button class="btn btn-icon acknowledge-btn" title="Reconhecer" data-alert-id="${alert.id}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </button>
                            <button class="btn btn-icon resolve-btn" title="Resolver" data-alert-id="${alert.id}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                            </button>
                        ` : ''}
                        <button class="btn btn-icon view-btn" title="Visualizar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        this.tableBody.innerHTML = rows.length > 0 ? rows.join('') : '<tr><td colspan="9">Nenhum alerta encontrado</td></tr>';
        
        // Add click handlers
        this.addRowClickHandlers();
    }
    
    static addRowClickHandlers() {
        const rows = this.tableBody?.querySelectorAll('tr[data-alert-id]');
        if (!rows) return;
        
        rows.forEach(row => {
            const alertId = row.dataset.alertId;
            const viewBtn = row.querySelector('.view-btn');
            const acknowledgeBtn = row.querySelector('.acknowledge-btn');
            const resolveBtn = row.querySelector('.resolve-btn');
            
            // View handler
            const handleView = () => {
                const alert = this.data.alerts.find(a => a.id === alertId);
                if (alert) {
                    this.showAlertDetails(alert);
                }
            };
            
            row.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON') {
                    handleView();
                }
            });
            
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleView();
                });
            }
            
            // Acknowledge handler
            if (acknowledgeBtn) {
                acknowledgeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.acknowledgeAlert(alertId);
                });
            }
            
            // Resolve handler
            if (resolveBtn) {
                resolveBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.resolveAlert(alertId);
                });
            }
        });
    }
    
    static showAlertDetails(alert) {
        const vessel = this.data.vessels.find(v => v.id === alert.vesselId);
        const port = vessel ? window.App.getPort(vessel.originPortId) : null;
        
        alert(`
Detalhes do Alerta RedFlag

ID: ${alert.id}
Vessel: ${vessel?.name || alert.vesselName || 'N/A'}
Tipo: ${this.getAlertTypeLabel(alert.type)}
Severidade: ${this.getSeverityLabel(alert.severity)}
Status: ${this.getStatusLabel(alert.status)}

Mensagem:
${alert.message}

Detalhes:
${JSON.stringify(alert.details || {}, null, 2)}

Timestamp: ${new Date(alert.timestamp).toLocaleString('pt-BR')}
Playbook: ${alert.playbook || 'N/A'}
Responsavel: ${alert.responsible || 'N/A'}
SLA: ${alert.sla || 0} minutos

${alert.requiresApproval ? 'REQUER APROVACAO HUMANA' : ''}
        `);
    }
    
    static async acknowledgeAlert(alertId) {
        try {
            const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user: 'OPERATOR' })
            });
            
            if (response.ok) {
                if (window.App) {
                    window.App.refreshAllData();
                }
            } else {
                alert('Error acknowledging alert');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error acknowledging alert');
        }
    }
    
    static async resolveAlert(alertId) {
        const notes = prompt('Enter resolution notes:');
        if (!notes) return;
        
        try {
            const response = await fetch(`/api/alerts/${alertId}/resolve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    user: 'OPERATOR',
                    notes: notes
                })
            });
            
            if (response.ok) {
                if (window.App) {
                    window.App.refreshAllData();
                }
            } else {
                alert('Error resolving alert');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error resolving alert');
        }
    }
    
    static getAlertTypeLabel(type) {
        const labels = {
            'DEVIATION': 'Desvio de Rota',
            'UNAUTHORIZED_STOP': 'Parada Nao Autorizada',
            'DOCUMENTATION_ISSUE': 'Problema de Documentacao',
            'CUSTOMS_ALERT': 'Alerta Alfandegario',
            'TAX_DISCREPANCY': 'Divergencia de Imposto',
            'CONTAINER_ISSUE': 'Problema com Conteiner',
            'SECURITY_THREAT': 'Ameaca de Seguranca'
        };
        return labels[type] || type || 'N/A';
    }
    
    static getSeverityLabel(severity) {
        const labels = {
            'LOW': 'Baixa',
            'MEDIUM': 'Media',
            'HIGH': 'Alta',
            'CRITICAL': 'Critica'
        };
        return labels[severity] || severity || 'N/A';
    }
    
    static getStatusLabel(status) {
        const labels = {
            'ACTIVE': 'Ativo',
            'ACKNOWLEDGED': 'Reconhecido',
            'RESOLVED': 'Resolvido'
        };
        return labels[status] || status || 'N/A';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AlertsModule.init(window.App ? window.App.getData() : { alerts: [], vessels: [] });
});
