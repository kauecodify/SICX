// SICX Satellite Tracking - Map Module

class MapModule {
    static init(data) {
        this.data = data;
        this.map = null;
        this.markers = {
            vessels: new Map(),
            ports: new Map(),
            routes: new Map()
        };
        this.layers = {
            vessels: true,
            routes: true,
            ports: true,
            zones: false
        };
        
        this.initializeMap();
        this.setupEventListeners();
    }
    
    static initializeMap() {
        // Initialize Leaflet map
        this.map = L.map('map').setView([-23.5505, -46.6333], 4);
        
        // Add tile layers
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });
        
        const baseLayers = {
            'OpenStreetMap': osmLayer,
            'Satellite': satelliteLayer
        };
        
        osmLayer.addTo(this.map);
        
        // Add layer control
        L.control.layers(baseLayers).addTo(this.map);
        
        // Add scale control
        L.control.scale().addTo(this.map);
        
        // Initialize markers
        this.initializeMarkers();
        
        // Subscribe to data updates
        if (window.App) {
            window.App.subscribe('vessels', (vessels) => {
                this.updateVesselMarkers(vessels);
            });
            
            window.App.subscribe('ports', (ports) => {
                this.updatePortMarkers(ports);
            });
        }
    }
    
    static initializeMarkers() {
        // Create markers for existing data
        if (this.data.vessels && this.data.vessels.length > 0) {
            this.updateVesselMarkers(this.data.vessels);
        }
        
        if (this.data.ports && this.data.ports.length > 0) {
            this.updatePortMarkers(this.data.ports);
        }
        
        // Draw routes
        this.drawRoutes();
    }
    
    static updateVesselMarkers(vessels) {
        // Clear existing vessel markers
        this.markers.vessels.forEach(marker => this.map.removeLayer(marker));
        this.markers.vessels.clear();
        
        if (!this.layers.vessels) return;
        
        vessels.forEach(vessel => {
            if (vessel.latitude && vessel.longitude) {
                const marker = this.createVesselMarker(vessel);
                this.markers.vessels.set(vessel.id, marker);
                
                // Add tooltip
                marker.bindTooltip(`<b>${vessel.name}</b><br>IMO: ${vessel.imo || 'N/A'}<br>Velocidade: ${vessel.speed || 0} kn`, {
                    permanent: false,
                    direction: 'top'
                });
                
                // Add click handler
                marker.on('click', () => this.showVesselInfo(vessel));
            }
        });
    }
    
    static createVesselMarker(vessel) {
        const icon = L.divIcon({
            className: `vessel-marker ${vessel.status?.toLowerCase() || 'at-sea'}`,
            html: this.getVesselIconHtml(vessel),
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });
        
        return L.marker([vessel.latitude, vessel.longitude], {
            icon: icon,
            rotationAngle: vessel.course || 0,
            rotationOrigin: 'center center'
        });
    }
    
    static getVesselIconHtml(vessel) {
        const status = vessel.status?.toLowerCase() || 'at-sea';
        const color = this.getStatusColor(status);
        const course = vessel.course || 0;
        
        return `
            <svg width="20" height="20" viewBox="0 0 20 20" style="transform: rotate(${course}deg); transform-origin: center;">
                <polygon points="10,0 18,10 10,16 2,10" fill="${color}" stroke="white" stroke-width="1"/>
                <text x="10" y="12" text-anchor="middle" fill="white" font-size="6">${vessel.name ? vessel.name.charAt(0) : 'V'}</text>
            </svg>
        `;
    }
    
    static getStatusColor(status) {
        const colors = {
            'at_sea': '#002776',
            'at-sea': '#002776',
            'anchored': '#ff9800',
            'moored': '#4caf50'
        };
        return colors[status] || '#002776';
    }
    
    static updatePortMarkers(ports) {
        // Clear existing port markers
        this.markers.ports.forEach(marker => this.map.removeLayer(marker));
        this.markers.ports.clear();
        
        if (!this.layers.ports) return;
        
        ports.forEach(port => {
            if (port.latitude && port.longitude) {
                const marker = this.createPortMarker(port);
                this.markers.ports.set(port.id, marker);
                
                // Add tooltip
                marker.bindTooltip(`<b>${port.name}</b><br>${port.country}<br>Bloco: ${port.block || 'N/A'}`, {
                    permanent: false,
                    direction: 'top'
                });
                
                // Add click handler
                marker.on('click', () => this.showPortInfo(port));
            }
        });
    }
    
    static createPortMarker(port) {
        const size = this.getPortSize(port.size);
        const color = this.getPortColor(port.block);
        
        const icon = L.divIcon({
            className: `port-marker ${port.size?.toLowerCase() || 'medium'}`,
            html: `
                <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
                    <text x="${size/2}" y="${size/2 + 3}" text-anchor="middle" fill="white" font-size="${size/2}">${port.name ? port.name.charAt(0) : 'P'}</text>
                </svg>
            `,
            iconSize: [size, size],
            iconAnchor: [size/2, size/2],
            popupAnchor: [0, -size/2]
        });
        
        return L.marker([port.latitude, port.longitude], { icon: icon });
    }
    
    static getPortSize(size) {
        const sizes = {
            'LARGE': 20,
            'MEDIUM': 16,
            'SMALL': 12
        };
        return sizes[size?.toUpperCase()] || 16;
    }
    
    static getPortColor(block) {
        const colors = {
            'BRASIL': '#006B3F',
            'MERCOSUL': '#002776',
            'BRICS': '#C9A227',
            'CPLP': '#7b1fa2'
        };
        return colors[block?.toUpperCase()] || '#6B6B6B';
    }
    
    static drawRoutes() {
        // Draw routes between ports
        // This is a simplified version - in production, use actual route data
        
        const sampleRoutes = [
            { from: [-23.5505, -46.6333], to: [31.2304, 121.4737] }, // Santos to Shanghai
            { from: [-34.6037, -58.3816], to: [-23.5505, -46.6333] }, // Buenos Aires to Santos
            { from: [-22.8167, -43.2500], to: [-29.8587, 31.0218] } // Rio to Durban
        ];
        
        if (!this.layers.routes) return;
        
        sampleRoutes.forEach(route => {
            L.polyline([route.from, route.to], {
                color: '#002776',
                weight: 2,
                opacity: 0.7,
                dashArray: '5, 10'
            }).addTo(this.map);
        });
    }
    
    static showVesselInfo(vessel) {
        const infoPanel = document.getElementById('vesselInfo');
        const mapInfoPanel = document.querySelector('.map-info-panel');
        
        if (!infoPanel || !mapInfoPanel) return;
        
        // Get additional vessel details
        const details = this.getVesselDetails(vessel);
        
        infoPanel.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">ID</span>
                    <span class="info-value">${vessel.id}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nome</span>
                    <span class="info-value">${vessel.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">IMO</span>
                    <span class="info-value">${vessel.imo || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">MMSI</span>
                    <span class="info-value">${vessel.mmsi || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Bandeira</span>
                    <span class="info-value">${vessel.flag}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tipo</span>
                    <span class="info-value">${vessel.vesselType}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status</span>
                    <span class="info-value"><span class="status-badge ${vessel.status?.toLowerCase()}">${vessel.status || 'N/A'}</span></span>
                </div>
                <div class="info-item">
                    <span class="info-label">Velocidade</span>
                    <span class="info-value">${vessel.speed || 0} kn</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Curso</span>
                    <span class="info-value">${vessel.course || 0}°</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Posicao</span>
                    <span class="info-value">${vessel.latitude?.toFixed(4)}, ${vessel.longitude?.toFixed(4)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Origem</span>
                    <span class="info-value">${details.originPort || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Destino</span>
                    <span class="info-value">${details.destinationPort || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Contrato</span>
                    <span class="info-value">${vessel.contractType || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">CBS</span>
                    <span class="info-value">R$ ${this.formatNumber(vessel.cbs || 0)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">IBS</span>
                    <span class="info-value">R$ ${this.formatNumber(vessel.ibs || 0)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Imp. Importacao</span>
                    <span class="info-value">R$ ${this.formatNumber(vessel.importTax || 0)}</span>
                </div>
                <div class="info-item full-width">
                    <span class="info-label">Hash de Rastreabilidade</span>
                    <span class="info-value" style="font-size: 0.8rem;">${vessel.trackingHash || 'N/A'}</span>
                </div>
            </div>
            ${details.alerts.length > 0 ? `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #E5E1D8;">
                    <h4 style="margin-bottom: 0.5rem; color: #d32f2f;">Alertas Ativos</h4>
                    ${details.alerts.map(alert => `
                        <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: #FFEBEE; border-radius: 4px;">
                            <strong>${alert.type}</strong>: ${alert.message}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        mapInfoPanel.classList.add('active');
        
        // Center map on vessel
        if (vessel.latitude && vessel.longitude) {
            this.map.setView([vessel.latitude, vessel.longitude], 8);
        }
    }
    
    static getVesselDetails(vessel) {
        const originPort = window.App ? window.App.getPort(vessel.originPortId) : null;
        const destinationPort = window.App ? window.App.getPort(vessel.destinationPortId) : null;
        const alerts = window.App ? window.App.getAlertsForVessel(vessel.id) : [];
        
        return {
            originPort: originPort?.name || vessel.originPortId,
            destinationPort: destinationPort?.name || vessel.destinationPortId,
            alerts: alerts
        };
    }
    
    static showPortInfo(port) {
        const infoPanel = document.getElementById('vesselInfo');
        const mapInfoPanel = document.querySelector('.map-info-panel');
        
        if (!infoPanel || !mapInfoPanel) return;
        
        infoPanel.innerHTML = `
            <div class="info-grid">
                <div class="info-item full-width">
                    <span class="info-label">Nome</span>
                    <span class="info-value">${port.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Pais</span>
                    <span class="info-value">${port.country}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Regiao</span>
                    <span class="info-value">${port.region}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Bloco</span>
                    <span class="info-value"><span class="status-badge" style="background: ${this.getPortColor(port.block)};">${port.block}</span></span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tipo</span>
                    <span class="info-value">${port.type}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tamanho</span>
                    <span class="info-value">${port.size}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Calado Maximo</span>
                    <span class="info-value">${port.draught || 0}m</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Capacidade</span>
                    <span class="info-value">${this.formatNumber(port.containersCapacity || 0)} TEUs</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Embarcacoes no Porto</span>
                    <span class="info-value">${port.vesselsInPort?.length || 0}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Embarcacoes em Fila</span>
                    <span class="info-value">${port.queuedVessels?.length || 0}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tempo de Espera</span>
                    <span class="info-value">${port.estimatedWaitingTime || 0} horas</span>
                </div>
                <div class="info-item full-width">
                    <span class="info-label">Posicao</span>
                    <span class="info-value">${port.latitude?.toFixed(4)}, ${port.longitude?.toFixed(4)}</span>
                </div>
            </div>
        `;
        
        mapInfoPanel.classList.add('active');
        
        // Center map on port
        if (port.latitude && port.longitude) {
            this.map.setView([port.latitude, port.longitude], 10);
        }
    }
    
    static setupEventListeners() {
        // Close info panel
        const closeBtn = document.getElementById('closeInfoPanel');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const mapInfoPanel = document.querySelector('.map-info-panel');
                if (mapInfoPanel) {
                    mapInfoPanel.classList.remove('active');
                }
            });
        }
        
        // Layer control buttons
        const layerButtons = document.querySelectorAll('.control-btn[data-layer]');
        layerButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const layer = btn.dataset.layer;
                this.layers[layer] = !this.layers[layer];
                btn.classList.toggle('active', this.layers[layer]);
                
                // Update markers
                if (layer === 'vessels') {
                    this.updateVesselMarkers(this.data.vessels);
                } else if (layer === 'ports') {
                    this.updatePortMarkers(this.data.ports);
                } else if (layer === 'routes') {
                    // Re-draw routes
                    this.markers.routes.forEach(layer => this.map.removeLayer(layer));
                    this.markers.routes.clear();
                    this.drawRoutes();
                }
            });
        });
        
        // Zoom controls
        const zoomInBtn = document.querySelector('.control-btn[data-action="zoom-in"]');
        const zoomOutBtn = document.querySelector('.control-btn[data-action="zoom-out"]');
        const locateBtn = document.querySelector('.control-btn[data-action="locate"]');
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.map.zoomIn());
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.map.zoomOut());
        }
        
        if (locateBtn) {
            locateBtn.addEventListener('click', () => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        this.map.setView([position.coords.latitude, position.coords.longitude], 12);
                    });
                }
            });
        }
    }
    
    static formatNumber(num) {
        return new Intl.NumberFormat('pt-BR').format(num);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof L !== 'undefined') {
        MapModule.init(window.App ? window.App.getData() : { vessels: [], ports: [] });
    }
});
