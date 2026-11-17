// SICX Satellite Tracking - Main Application

class App {
    constructor() {
        this.ws = null;
        this.data = {
            vessels: [],
            ports: [],
            alerts: [],
            routes: []
        };
        this.subscribers = {
            vessels: new Set(),
            ports: new Set(),
            alerts: new Set()
        };
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupWebSocket();
        this.loadInitialData();
        this.setupEventListeners();
        this.updateLastUpdate();
        
        // Start periodic updates
        setInterval(() => this.updateLastUpdate(), 1000);
    }
    
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.section + '-section';
                
                // Update active states
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(sectionId).classList.add('active');
            });
        });
    }
    
    setupWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = 3001; // WebSocket port
        const wsUrl = `${protocol}//${host}:${port}`;
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.updateWSStatus(true);
                
                // Request initial data
                this.ws.send(JSON.stringify({ type: 'INITIAL_DATA' }));
            };
            
            this.ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.handleWebSocketMessage(message);
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.updateWSStatus(false);
                
                // Attempt to reconnect
                setTimeout(() => this.setupWebSocket(), 5000);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateWSStatus(false);
            };
        } catch (error) {
            console.error('WebSocket not supported or error:', error);
            this.updateWSStatus(false);
        }
    }
    
    updateWSStatus(connected) {
        const statusEl = document.getElementById('wsStatus');
        const dotEl = statusEl.querySelector('.ws-dot');
        const textEl = statusEl.querySelector('span:last-child');
        
        if (connected) {
            statusEl.classList.add('connected');
            textEl.textContent = 'Conectado';
        } else {
            statusEl.classList.remove('connected');
            textEl.textContent = 'Desconectado';
        }
    }
    
    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'INITIAL_DATA':
                this.data.vessels = message.vessels || [];
                this.data.ports = message.ports || [];
                this.data.alerts = message.alerts || [];
                
                this.notifySubscribers('vessels', this.data.vessels);
                this.notifySubscribers('ports', this.data.ports);
                this.notifySubscribers('alerts', this.data.alerts);
                
                // Initialize all modules
                this.initModules();
                break;
                
            case 'VESSEL_POSITIONS':
                // Update vessel positions
                message.data.forEach(update => {
                    const vesselIndex = this.data.vessels.findIndex(v => v.id === update.vesselId);
                    if (vesselIndex !== -1) {
                        this.data.vessels[vesselIndex] = {
                            ...this.data.vessels[vesselIndex],
                            ...update
                        };
                    }
                });
                this.notifySubscribers('vessels', this.data.vessels);
                break;
                
            case 'VESSEL_UPDATE':
                const vesselIndex = this.data.vessels.findIndex(v => v.id === message.data.id);
                if (vesselIndex !== -1) {
                    this.data.vessels[vesselIndex] = message.data;
                } else {
                    this.data.vessels.push(message.data);
                }
                this.notifySubscribers('vessels', this.data.vessels);
                break;
                
            case 'NEW_ALERT':
                this.data.alerts.push(message.data);
                this.notifySubscribers('alerts', this.data.alerts);
                
                // Show notification
                this.showNotification('Novo Alerta RedFlag', message.data.message);
                break;
                
            case 'VESSEL_DETAILS':
                // Handle vessel details
                this.notifySubscribers('vesselDetails', message.data);
                break;
                
            case 'SATELLITE_DATA':
                // Handle satellite data
                this.notifySubscribers('satelliteData', message.data);
                break;
                
            default:
                console.log('Unknown message type:', message.type);
        }
    }
    
    loadInitialData() {
        // Fallback: Load data from API if WebSocket not available
        this.fetchData('/api/vessels').then(vessels => {
            this.data.vessels = vessels;
            this.notifySubscribers('vessels', vessels);
        });
        
        this.fetchData('/api/ports').then(ports => {
            this.data.ports = ports;
            this.notifySubscribers('ports', ports);
        });
        
        this.fetchData('/api/alerts').then(alerts => {
            this.data.alerts = alerts;
            this.notifySubscribers('alerts', alerts);
        });
        
        this.fetchData('/api/statistics').then(stats => {
            this.notifySubscribers('statistics', stats);
        });
    }
    
    initModules() {
        // Initialize all modules with data
        if (typeof MapModule !== 'undefined') {
            MapModule.init(this.data);
        }
        if (typeof VesselsModule !== 'undefined') {
            VesselsModule.init(this.data);
        }
        if (typeof PortsModule !== 'undefined') {
            PortsModule.init(this.data);
        }
        if (typeof AlertsModule !== 'undefined') {
            AlertsModule.init(this.data);
        }
        if (typeof DashboardModule !== 'undefined') {
            DashboardModule.init(this.data);
        }
    }
    
    async fetchData(endpoint) {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    }
    
    subscribe(type, callback) {
        this.subscribers[type].add(callback);
        return () => this.subscribers[type].delete(callback);
    }
    
    notifySubscribers(type, data) {
        this.subscribers[type].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in subscriber:', error);
            }
        });
    }
    
    setupEventListeners() {
        // Global event listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.refreshAllData();
            }
        });
    }
    
    async refreshAllData() {
        await this.loadInitialData();
        this.updateLastUpdate();
    }
    
    updateLastUpdate() {
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) {
            lastUpdateEl.textContent = new Date().toLocaleString('pt-BR');
        }
    }
    
    showNotification(title, message) {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, {
                        body: message,
                        icon: '/favicon.ico'
                    });
                }
            });
        }
        
        // Also show in-page notification
        this.showInPageNotification(title, message);
    }
    
    showInPageNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 1rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    getData() {
        return this.data;
    }
    
    getVessel(vesselId) {
        return this.data.vessels.find(v => v.id === vesselId);
    }
    
    getPort(portId) {
        return this.data.ports.find(p => p.id === portId);
    }
    
    getAlertsForVessel(vesselId) {
        return this.data.alerts.filter(a => a.vesselId === vesselId);
    }
}

// Initialize App
let AppInstance;
document.addEventListener('DOMContentLoaded', () => {
    AppInstance = new App();
    window.App = AppInstance; // Make available globally for debugging
});

// Export for modules
window.App = AppInstance;
