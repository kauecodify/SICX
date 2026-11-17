// SICX Satellite Tracking - Vessels Module

class VesselsModule {
    static init(data) {
        this.data = data;
        this.tableBody = document.getElementById('vesselsTableBody');
        this.searchInput = document.getElementById('vesselSearch');
        this.statusFilter = document.getElementById('statusFilter');
        this.portFilter = document.getElementById('portFilter');
        this.flagFilter = document.getElementById('flagFilter');
        this.contractFilter = document.getElementById('contractFilter');
        
        this.setupEventListeners();
        this.renderTable();
        this.populateFilters();
        
        // Subscribe to data updates
        if (window.App) {
            window.App.subscribe('vessels', (vessels) => {
                this.data.vessels = vessels;
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
        if (this.statusFilter) {
            this.statusFilter.addEventListener('change', () => this.filterAndRender());
        }
        if (this.portFilter) {
            this.portFilter.addEventListener('change', () => this.filterAndRender());
        }
        if (this.flagFilter) {
            this.flagFilter.addEventListener('change', () => this.filterAndRender());
        }
        if (this.contractFilter) {
            this.contractFilter.addEventListener('change', () => this.filterAndRender());
        }
    }
    
    static populateFilters() {
        // Populate port filter
        if (this.portFilter && window.App) {
            const ports = window.App.getData().ports || [];
            const portOptions = ports.map(port => 
                `<option value="${port.id}">${port.name} (${port.country})</option>`
            ).join('');
            this.portFilter.innerHTML = '<option value="">Todos os Portos</option>' + portOptions;
        }
        
        // Populate flag filter
        if (this.flagFilter) {
            const flags = [...new Set(this.data.vessels.map(v => v.flag).filter(Boolean))];
            const flagOptions = flags.map(flag => 
                `<option value="${flag}">${flag}</option>`
            ).join('');
            this.flagFilter.innerHTML = '<option value="">Todas as Bandeiras</option>' + flagOptions;
        }
    }
    
    static filterAndRender() {
        const searchTerm = this.searchInput?.value.toLowerCase() || '';
        const status = this.statusFilter?.value || '';
        const portId = this.portFilter?.value || '';
        const flag = this.flagFilter?.value || '';
        const contractType = this.contractFilter?.value || '';
        
        const filtered = this.data.vessels.filter(vessel => {
            const matchesSearch = !searchTerm || 
                (vessel.name && vessel.name.toLowerCase().includes(searchTerm)) ||
                (vessel.id && vessel.id.toLowerCase().includes(searchTerm)) ||
                (vessel.imo && vessel.imo.toString().includes(searchTerm));
            
            const matchesStatus = !status || vessel.status === status;
            const matchesPort = !portId || 
                vessel.originPortId === portId || 
                vessel.destinationPortId === portId;
            const matchesFlag = !flag || vessel.flag === flag;
            const matchesContract = !contractType || vessel.contractType === contractType;
            
            return matchesSearch && matchesStatus && matchesPort && matchesFlag && matchesContract;
        });
        
        this.renderTable(filtered);
    }
    
    static renderTable(vessels = this.data.vessels) {
        if (!this.tableBody) return;
        
        const rows = vessels.map(vessel => {
            const originPort = window.App ? window.App.getPort(vessel.originPortId) : null;
            const destinationPort = window.App ? window.App.getPort(vessel.destinationPortId) : null;
            
            return `
                <tr data-vessel-id="${vessel.id}">
                    <td>${vessel.id}</td>
                    <td><strong>${vessel.name}</strong></td>
                    <td>${vessel.flag}</td>
                    <td>${vessel.vesselType}</td>
                    <td>${vessel.latitude?.toFixed(4)}, ${vessel.longitude?.toFixed(4)}</td>
                    <td>${vessel.speed || 0} kn</td>
                    <td><span class="status-badge ${vessel.status?.toLowerCase()}">${vessel.status || 'N/A'}</span></td>
                    <td>${originPort?.name || vessel.originPortId || 'N/A'}</td>
                    <td>${destinationPort?.name || vessel.destinationPortId || 'N/A'}</td>
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
        
        this.tableBody.innerHTML = rows.length > 0 ? rows.join('') : '<tr><td colspan="10">Nenhuma embarcacao encontrada</td></tr>';
        
        // Add click handlers
        this.addRowClickHandlers();
    }
    
    static addRowClickHandlers() {
        const rows = this.tableBody?.querySelectorAll('tr[data-vessel-id]');
        if (!rows) return;
        
        rows.forEach(row => {
            const vesselId = row.dataset.vesselId;
            const viewBtn = row.querySelector('.view-btn');
            
            const handleClick = () => {
                const vessel = this.data.vessels.find(v => v.id === vesselId);
                if (vessel) {
                    // Show on map
                    if (typeof MapModule !== 'undefined' && MapModule.map) {
                        MapModule.showVesselInfo(vessel);
                    }
                    
                    // Switch to map view
                    const mapSection = document.getElementById('map-section');
                    const vesselsSection = document.getElementById('vessels-section');
                    const navLinks = document.querySelectorAll('.nav-link');
                    
                    if (mapSection && vesselsSection) {
                        vesselsSection.classList.remove('active');
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
    VesselsModule.init(window.App ? window.App.getData() : { vessels: [] });
});
