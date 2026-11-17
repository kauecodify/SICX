// SICX Satellite Tracking - Dashboard Module

class DashboardModule {
    static init(data) {
        this.data = data;
        this.stats = {};
        
        this.totalVesselsEl = document.getElementById('totalVessels');
        this.totalPortsEl = document.getElementById('totalPorts');
        this.activeAlertsEl = document.getElementById('activeAlerts');
        this.atSeaVesselsEl = document.getElementById('atSeaVessels');
        this.recentActivityEl = document.getElementById('recentActivity');
        
        this.portDistributionChart = null;
        this.alertTypeChart = null;
        
        this.setupCharts();
        this.updateStatistics();
        this.updateRecentActivity();
        
        // Subscribe to data updates
        if (window.App) {
            window.App.subscribe('vessels', () => this.updateStatistics());
            window.App.subscribe('ports', () => this.updateStatistics());
            window.App.subscribe('alerts', () => {
                this.updateStatistics();
                this.updateRecentActivity();
            });
            window.App.subscribe('statistics', (stats) => {
                this.stats = stats;
                this.updateStatistics();
            });
        }
    }
    
    static setupCharts() {
        // Port distribution chart
        const portCtx = document.getElementById('portDistributionChart');
        if (portCtx) {
            this.portDistributionChart = new Chart(portCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Brasil', 'Mercosul', 'BRICS', 'CPLP'],
                    datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: [
                            '#006B3F',
                            '#002776',
                            '#C9A227',
                            '#7b1fa2'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        // Alert type chart
        const alertCtx = document.getElementById('alertTypeChart');
        if (alertCtx) {
            this.alertTypeChart = new Chart(alertCtx, {
                type: 'bar',
                data: {
                    labels: ['Desvio', 'Parada', 'Documento', 'Alfandega', 'Imposto', 'Conteiner', 'Seguranca'],
                    datasets: [{
                        label: 'Alertas por Tipo',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: [
                            '#d32f2f',
                            '#ff9800',
                            '#ffc107',
                            '#7b1fa2',
                            '#009688',
                            '#2196f3',
                            '#607d8b'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    }
    
    static updateStatistics() {
        // Get statistics
        const vessels = this.data.vessels || [];
        const ports = this.data.ports || [];
        const alerts = this.data.alerts || [];
        
        // Update stat cards
        if (this.totalVesselsEl) {
            this.totalVesselsEl.textContent = vessels.length;
        }
        if (this.totalPortsEl) {
            this.totalPortsEl.textContent = ports.length;
        }
        if (this.activeAlertsEl) {
            this.activeAlertsEl.textContent = alerts.filter(a => a.status === 'ACTIVE').length;
        }
        if (this.atSeaVesselsEl) {
            this.atSeaVesselsEl.textContent = vessels.filter(v => v.status === 'AT_SEA').length;
        }
        
        // Update port distribution chart
        if (this.portDistributionChart) {
            const blocks = {};
            ports.forEach(port => {
                blocks[port.block] = (blocks[port.block] || 0) + 1;
            });
            
            this.portDistributionChart.data.datasets[0].data = [
                blocks['BRASIL'] || 0,
                blocks['MERCOSUL'] || 0,
                blocks['BRICS'] || 0,
                blocks['CPLP'] || 0
            ];
            this.portDistributionChart.update();
        }
        
        // Update alert type chart
        if (this.alertTypeChart) {
            const types = {};
            alerts.forEach(alert => {
                const type = this.getAlertTypeIndex(alert.type);
                if (type !== -1) {
                    types[type] = (types[type] || 0) + 1;
                }
            });
            
            const data = [0, 0, 0, 0, 0, 0, 0];
            Object.keys(types).forEach(key => {
                data[key] = types[key];
            });
            
            this.alertTypeChart.data.datasets[0].data = data;
            this.alertTypeChart.update();
        }
    }
    
    static getAlertTypeIndex(type) {
        const types = [
            'DEVIATION',
            'UNAUTHORIZED_STOP',
            'DOCUMENTATION_ISSUE',
            'CUSTOMS_ALERT',
            'TAX_DISCREPANCY',
            'CONTAINER_ISSUE',
            'SECURITY_THREAT'
        ];
        return types.indexOf(type);
    }
    
    static updateRecentActivity() {
        if (!this.recentActivityEl) return;
        
        const alerts = this.data.alerts || [];
        const vessels = this.data.vessels || [];
        
        // Combine recent alerts and vessel position updates
        const activities = [];
        
        // Add recent alerts
        alerts
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5)
            .forEach(alert => {
                activities.push({
                    type: 'alert',
                    time: new Date(alert.timestamp).toLocaleTimeString('pt-BR'),
                    message: `Alerta ${alert.type}: ${alert.message}`,
                    severity: alert.severity
                });
            });
        
        // Add recent vessel updates
        vessels
            .filter(v => v.lastUpdate)
            .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate))
            .slice(0, 5)
            .forEach(vessel => {
                activities.push({
                    type: 'vessel',
                    time: new Date(vessel.lastUpdate).toLocaleTimeString('pt-BR'),
                    message: `Atualizacao de posicao: ${vessel.name}`,
                    vesselId: vessel.id
                });
            });
        
        // Sort by time and take top 10
        activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 10)
            .forEach(activity => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.innerHTML = `
                    <span class="activity-time">${activity.time}</span>
                    <span class="activity-message">${activity.message}</span>
                    <span class="activity-type ${activity.type}">${activity.type === 'alert' ? 'Alerta' : 'Embarcacao'}</span>
                `;
                this.recentActivityEl.appendChild(item);
            });
    }
    
    static formatNumber(num) {
        return new Intl.NumberFormat('pt-BR').format(num);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    DashboardModule.init(window.App ? window.App.getData() : {});
});
