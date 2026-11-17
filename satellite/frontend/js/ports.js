// SICX Satellite Tracking - Ports Module

class PortsModule {
    static init(data) {
        this.data = data;
        this.tableBody = document.getElementById('portsTableBody');
        this.searchInput = document.getElementById('portSearch');
        this.countryFilter = document.getElementById('countryFilter');
        this.blockFilter = document.getElementById('blockFilter');
        this.sizeFilter = document.getElementById('sizeFilter');
        
        this.setupEventListeners();
        this.renderTable();
        this.populateFilters();
        
        // Subscribe to data updates
        if (window.App) {
            window.App.subscribe('ports', (ports) => {
                this.data.ports = ports;
                this.renderTable();
            });
        }
    }
    
    static setupEventListeners() {
        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.filterAndRender();
            });
        }
        
        // Filters
        if (this.countryFilter) {
            this.countryFilter.addEventListener('change', () => this.filterAndRender());
        }
        if (this.blockFilter) {
            this.blockFilter.addEventListener('change', () => this.filterAndRender());
        }
        if (this.sizeFilter) {
            this.sizeFilter.addEventListener('change', () => this.filterAndRender());
        }
    }
    
    static populateFilters() {
        // Populate country filter
        if (this.countryFilter) {
            const countries = [...new Set(this.data.ports.map(p => p.country).filter(Boolean))];
            const countryOptions = countries.map(country => 
                `<option value="${country}">${country}</option>`
            ).join('');
            this.countryFilter.innerHTML = '<option value="">Todos os Paises</option>' + countryOptions;
        }
    }
    
    static filterAndRender() {
        const searchTerm = this.searchInput?.value.toLowerCase() || '';
        const country = this.countryFilter?.value || '';
        const block = this.blockFilter?.value || '';
        const size = this.sizeFilter?.value || '';
        
        const filtered = this.data.ports.filter(port => {
            const matchesSearch = !searchTerm || 
                (port.name && port.name.toLowerCase().includes(searchTerm)) ||
                (port.code && port.code.toLowerCase().includes(searchTerm)) ||
                (port.country && port.country.toLowerCase().includes(searchTerm));
            
            const matchesCountry = !country || port.country === country;
            const matchesBlock = !block || port.block === block;
            const matchesSize = !size || port.size === size;
            
            return matchesSearch && matchesCountry && matchesBlock && matchesSize;
        });
        
        this.renderTable(filtered);
    }
    
    static renderTable(ports = this.data.ports) {
        if (!this.tableBody) return;
        
        const rows = ports.map(port => {
            const vesselsInPort = port.vesselsInPort?.length || 0;
            const queuedVessels = port.queuedVessels?.length || 0;
            const waitingTime = port.estimatedWaitingTime || 0;
            
            return `
                <tr data-port-id="${port.id}">
                    <td>${port.id}</td>
                    <td><strong>${port.name}</strong></td>
                    <td>${port.country}</td>
                    <td><span class="status-badge" style="background: ${MapModule.getPortColor(port.block)};">${port.block}</span></td>
                    <td>${port.type}</td>
                    <td>${port.size}</td>
                    <td>${this.formatNumber(port.containersCapacity || 0)}</td>
                    <td>${vesselsInPort}</td>
                    <td>${queuedVessels > 0 ? `${queuedVessels} (${waitingTime}h)` : '0'}</td>
                    <td>
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
        
        this.tableBody.innerHTML = rows.length > 0 ? rows.join('') : '<tr><td colspan="10">Nenhum porto encontrado</td></tr>';
        
        // Add click handlers
        this.addRowClickHandlers();
    }
    
    static addRowClickHandlers() {
        const rows = this.tableBody?.querySelectorAll('tr[data-port-id]');
        if (!rows) return;
        
        rows.forEach(row => {
            const portId = row.dataset.portId;
            const viewBtn = row.querySelector('.view-btn');
            
            const handleClick = () => {
                const port = this.data.ports.find(p => p.id === portId);
                if (port) {
                    // Show on map
                    if (typeof MapModule !== 'undefined' && MapModule.map) {
                        MapModule.showPortInfo(port);
                    }
                    
                    // Switch to map view
                    const mapSection = document.getElementById('map-section');
                    const portsSection = document.getElementById('ports-section');
                    const navLinks = document.querySelectorAll('.nav-link');
                    
                    if (mapSection && portsSection) {
                        portsSection.classList.remove('active');
                        mapSection.classList.add('active');
                        navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.dataset.section === 'map') {
                                link.classList.add('active');
                            }
                        });
                    }
                }
            };
            
            row.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON') {
                    handleClick();
                }
            });
            
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleClick();
                });
            }
        });
    }
    
    static formatNumber(num) {
        return new Intl.NumberFormat('pt-BR').format(num);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    PortsModule.init(window.App ? window.App.getData() : { ports: [] });
});
