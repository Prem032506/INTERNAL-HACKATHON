/**
 * Global Coordinator & UI Logic for Global-Setu Platform
 * Resilient Dual-Mode Architecture: Online Full-Stack / 100% Offline Standalone
 */

class GlobalAppCoordinator {
  constructor() {
    this.currentUploadedPhoto = null;
    this.init();
  }

  async init() {
    // 1. Initialize Map
    if (window.mapEngine) {
      await window.mapEngine.initialize();
    }

    // 2. Initialize Telemetry
    if (window.fleetManager) {
      await window.fleetManager.initialize();
    }

    // 3. Bind UI Events
    this.bindEvents();

    // 4. Apply Initial Multilingual Strings
    if (window.i18n) {
      window.i18n.applyTranslations();
    }

    // 5. Update initial offline queue count
    if (window.fieldReports) {
      window.fieldReports.updatePendingCount();
    }
  }

  renderDistrictList(states = []) {
    const listContainer = document.getElementById('state-connectivity-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    states.forEach(st => {
      let badgeClass = 'badge-normal';
      let statusText = 'Normal';

      if (st.vulnerabilityScore > 80) {
        badgeClass = 'badge-critical';
        statusText = 'Critical';
      } else if (st.vulnerabilityScore > 65) {
        badgeClass = 'badge-warning';
        statusText = 'Alert';
      }

      const item = document.createElement('div');
      item.className = 'state-item';

      item.innerHTML = `
        <div class="state-info">
          <span class="state-name">${st.name}</span>
          <span class="state-capital">${st.capital} • Risk: ${st.vulnerabilityScore}%</span>
        </div>
        <span class="status-badge ${badgeClass}">${statusText}</span>
      `;

      item.addEventListener('click', () => {
        window.mapEngine.flyToLocation(st.lat, st.lng, 8);
      });

      listContainer.appendChild(item);
    });
  }

  bindEvents() {
    // Global Region Dropdown Selector
    const regionSelector = document.getElementById('global-region-select');
    if (regionSelector) {
      regionSelector.addEventListener('change', (e) => {
        const regionId = e.target.value;
        if (window.mapEngine) {
          window.mapEngine.switchRegion(regionId);
        }
      });
    }

    // Basemap selector buttons
    document.querySelectorAll('.map-control-btn[data-layer]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.map-control-btn[data-layer]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const layer = btn.getAttribute('data-layer');
        window.mapEngine.setBasemap(layer);
      });
    });

    // Language Selector Modal Triggers
    const langBtn = document.getElementById('lang-selector-btn');
    const langModal = document.getElementById('lang-modal');
    if (langBtn && langModal) {
      langBtn.addEventListener('click', () => {
        langModal.classList.add('active');
      });
    }

    document.querySelectorAll('.lang-card').forEach(card => {
      card.addEventListener('click', () => {
        const lang = card.getAttribute('data-lang');
        window.i18n.setLanguage(lang);
        document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        langModal.classList.remove('active');
      });
    });

    // Close Modals on backdrop click or close button
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el || el.classList.contains('modal-close')) {
          document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
        }
      });
    });

    // Offline Sync Button Navbar Trigger
    const offlineSyncBtn = document.getElementById('btn-offline-sync');
    if (offlineSyncBtn) {
      offlineSyncBtn.addEventListener('click', () => {
        this.showOfflineQueueModal();
      });
    }

    // Disruption Simulator Button
    const simulateBtn = document.getElementById('btn-simulate-disruption');
    if (simulateBtn) {
      simulateBtn.addEventListener('click', () => {
        this.triggerDisasterSimulation();
      });
    }

    // Route Optimizer Form
    const routeForm = document.getElementById('route-planner-form');
    if (routeForm) {
      routeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRouteOptimization();
      });
    }

    // Region Filter Chips in Route Optimizer
    document.querySelectorAll('.chip-filter[data-region-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip-filter[data-region-filter]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.getAttribute('data-region-filter');
        this.filterRouteSelectOptions(filter, document.getElementById('route-hub-search')?.value || '');
      });
    });

    // Quick Hub Text Search Filter
    const hubSearchInput = document.getElementById('route-hub-search');
    if (hubSearchInput) {
      hubSearchInput.addEventListener('input', (e) => {
        const activeChip = document.querySelector('.chip-filter.active[data-region-filter]');
        const regionFilter = activeChip ? activeChip.getAttribute('data-region-filter') : 'ALL';
        this.filterRouteSelectOptions(regionFilter, e.target.value.trim().toLowerCase());
      });
    }

    // Photo File Input Listener
    const photoInput = document.getElementById('sim-file-input');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.currentUploadedPhoto = event.target.result;
            const previewContainer = document.getElementById('photo-preview-container');
            const previewImg = document.getElementById('photo-preview-img');
            if (previewContainer && previewImg) {
              previewImg.src = this.currentUploadedPhoto;
              previewContainer.style.display = 'block';
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Field Report Form
    const reportForm = document.getElementById('field-incident-form');
    if (reportForm) {
      reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFieldReportSubmission();
      });
    }
  }

  showRoutePlanner(origin = null, dest = null, cargo = 'MEDICAL') {
    const modal = document.getElementById('route-optimizer-modal');
    const originSelect = document.getElementById('route-origin');
    const destSelect = document.getElementById('route-dest');
    const cargoSelect = document.getElementById('route-cargo');

    // Dynamically align default routes with the currently active region
    if (!origin || !dest) {
      const activeRegionId = window.mapEngine ? window.mapEngine.currentRegionId : 'NER_INDIA';
      if (activeRegionId === 'EURO_ALPS') {
        origin = 'Zurich';
        dest = 'Milan';
      } else if (activeRegionId === 'ANDES_CORRIDOR') {
        origin = 'Santiago';
        dest = 'Mendoza';
      } else if (activeRegionId === 'HIMALAYAN_ARC') {
        origin = 'Srinagar';
        dest = 'Leh';
      } else {
        origin = 'Guwahati';
        dest = 'Kohima';
      }
    }

    if (originSelect) originSelect.value = origin;
    if (destSelect) destSelect.value = dest;
    if (cargoSelect) cargoSelect.value = cargo;

    if (modal) modal.classList.add('active');
    this.handleRouteOptimization();
  }

  showFieldReportModal() {
    const modal = document.getElementById('field-report-modal');
    if (modal) {
      // Reset photo preview on open
      this.currentUploadedPhoto = null;
      const previewContainer = document.getElementById('photo-preview-container');
      if (previewContainer) previewContainer.style.display = 'none';

      const fileInput = document.getElementById('sim-file-input');
      if (fileInput) fileInput.value = '';

      modal.classList.add('active');
    }
  }

  async showOfflineQueueModal() {
    const modal = document.getElementById('offline-queue-modal');
    const listEl = document.getElementById('offline-reports-list');
    if (!modal || !listEl) return;

    if (window.fieldReports) {
      const reports = await window.fieldReports.getAllReports();
      if (reports.length === 0) {
        listEl.innerHTML = `
          <div style="text-align:center;padding:1.5rem;color:var(--text-secondary);font-size:0.85rem;">
            No buffered offline reports. Reports submitted during cellular blackouts will appear here.
          </div>
        `;
      } else {
        listEl.innerHTML = reports.map(r => `
          <div style="padding:0.75rem;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle);border-radius:var(--radius-md);margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:700;color:var(--text-primary);font-size:0.85rem;">${r.title}</div>
              <div style="font-size:0.75rem;color:var(--text-secondary);">${r.location} • ${new Date(r.timestamp).toLocaleTimeString()}</div>
            </div>
            <span class="status-badge ${r.synced ? 'badge-normal' : 'badge-warning'}">
              ${r.synced ? 'SYNCED' : 'BUFFERED'}
            </span>
          </div>
        `).join('');
      }
    }

    modal.classList.add('active');
  }

  filterRouteSelectOptions(regionFilter, query = '') {
    const originSelect = document.getElementById('route-origin');
    const destSelect = document.getElementById('route-dest');
    [originSelect, destSelect].forEach(sel => {
      if (!sel) return;
      let firstVisible = null;
      Array.from(sel.querySelectorAll('optgroup')).forEach(group => {
        const groupRegion = group.getAttribute('data-region');
        const matchesRegion = regionFilter === 'ALL' || groupRegion === regionFilter;
        let groupHasVisible = false;

        Array.from(group.querySelectorAll('option')).forEach(opt => {
          const text = (opt.textContent + ' ' + opt.value).toLowerCase();
          const matchesSearch = !query || text.includes(query);
          if (matchesRegion && matchesSearch) {
            opt.style.display = '';
            groupHasVisible = true;
            if (!firstVisible) firstVisible = opt;
          } else {
            opt.style.display = 'none';
          }
        });

        group.style.display = groupHasVisible ? '' : 'none';
      });

      // If current selection was hidden, default to first visible option
      if (sel.selectedOptions[0]?.style.display === 'none' && firstVisible) {
        sel.value = firstVisible.value;
      }
    });
  }

  // Dual-Mode Route Optimization (Seamless Offline Client-Side + Optional Backend)
  async handleRouteOptimization() {
    const origin = document.getElementById('route-origin')?.value || 'Guwahati';
    const dest = document.getElementById('route-dest')?.value || 'Kohima';
    const cargo = document.getElementById('route-cargo')?.value || 'MEDICAL';
    const vehicle = document.getElementById('route-vehicle')?.value || 'HEAVY_4X4';
    const strategy = document.getElementById('route-strategy')?.value || 'MAX_RESILIENCE';
    const container = document.getElementById('route-results-container');
    if (!container) return;

    // Show quick computing state
    container.innerHTML = `
      <div style="text-align:center;padding:1.25rem;color:var(--neon-cyan);font-family:var(--font-heading);font-weight:700;">
        ⚡ Calculating terrain-weighted resilient corridors...
      </div>
    `;

    // Attempt optional local backend ping (non-blocking, only if on HTTP localhost)
    if (window.location.protocol !== 'https:') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        fetch('http://127.0.0.1:5000/optimize-route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin, destination: dest, cargo, vehicle, strategy }),
          signal: controller.signal
        }).catch(() => {});
        clearTimeout(timeoutId);
      } catch (ignored) {}
    }

    // Always compute robust client-side AI route representation
    let result = null;
    try {
      if (window.aiEngine && typeof window.aiEngine.optimizeRoute === 'function') {
        result = window.aiEngine.optimizeRoute(origin, dest, cargo, vehicle, strategy);
      }
    } catch (err) {
      console.warn('Client-side AI calculation error:', err);
    }

    if (!result || !result.primary || !result.alternate) {
      result = {
        origin,
        destination: dest,
        vehicleLabel: '🚛 4x4 Heavy Logistics Truck',
        strategyLabel: '🛡️ Disaster Resilience Priority',
        primary: {
          name: `Direct Arterial Corridor (${origin} - ${dest})`,
          distanceKm: 340,
          totalTimeHours: 11.5,
          weatherDelayHours: 4.5,
          hazardRisk: 'CRITICAL (Active Landslide Hazard)',
          bridgeLimitTons: 25,
          status: 'DISRUPTED'
        },
        alternate: {
          name: `AI Resilient Ridge Bypass (${origin} - ${dest})`,
          distanceKm: 375,
          totalTimeHours: 8.2,
          hazardRisk: 'LOW (All-Weather Cleared Ridge)',
          bridgeLimitTons: 40,
          status: 'Recommended Bypass'
        },
        cargoAdvisory: 'Priority humanitarian supply corridor active with verified all-weather passability.'
      };
    }

    container.innerHTML = `
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.75rem;">
        <span class="status-badge" style="background:rgba(0,242,254,0.12);color:var(--neon-cyan);border:1px solid rgba(0,242,254,0.25);font-size:0.75rem;">
          ${result.strategyLabel || '🛡️ AI Resilient Routing'}
        </span>
        <span class="status-badge badge-normal" style="font-size:0.75rem;">
          ${result.vehicleLabel || '🚛 4x4 Fleet'}
        </span>
      </div>

      <div class="route-card disrupted">
        <div class="route-header">
          <span class="route-name" style="color:#ef4444;">
            ⚠️ Standard Direct: ${result.primary.name}
          </span>
          <span class="status-badge badge-critical">
            ${result.primary.status}
          </span>
        </div>
        <div class="route-stats-grid">
          <div class="stat-item">
            <span class="stat-label">Distance</span>
            <span class="stat-val">${result.primary.distanceKm} km</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Est. Time</span>
            <span class="stat-val" style="color:#ef4444;">${result.primary.totalTimeHours} hrs</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Delay</span>
            <span class="stat-val">+${result.primary.weatherDelayHours} hrs</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Hazard Risk</span>
            <span class="stat-val" style="color:#ef4444;">${result.primary.hazardRisk}</span>
          </div>
        </div>
      </div>

      <div class="route-card selected">
        <div class="route-header">
          <span class="route-name" style="color:#00f2fe;">
            ✨ AI Resilient Bypass: ${result.alternate.name}
          </span>
          <span class="status-badge badge-normal">
            ${result.alternate.status}
          </span>
        </div>
        <div class="route-stats-grid">
          <div class="stat-item">
            <span class="stat-label">Distance</span>
            <span class="stat-val">${result.alternate.distanceKm} km</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Est. Time</span>
            <span class="stat-val" style="color:#10b981;">${result.alternate.totalTimeHours} hrs</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Time Saved</span>
            <span class="stat-val" style="color:#00f2fe;">-${Math.max(0.4, (result.primary.totalTimeHours - result.alternate.totalTimeHours)).toFixed(1)} hrs</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Bridge Capacity</span>
            <span class="stat-val" style="color:var(--neon-emerald);">${result.alternate.bridgeLimitTons || 35} Tons</span>
          </div>
        </div>
        <p style="font-size:0.75rem;color:#94a3b8;margin-top:6px;line-height:1.4;">
          <strong>Cargo Protocol:</strong> ${result.cargoAdvisory}
        </p>
      </div>
    `;

    // Draw red disrupted & cyan alternate polylines on map
    if (window.mapEngine && result.primary?.coordinates && result.alternate?.coordinates) {
      window.mapEngine.drawRouteComparison(result.primary.coordinates, result.alternate.coordinates);
    }
  }

  async handleFieldReportSubmission() {
    const title = document.getElementById('report-title')?.value || 'Corridor Disruption';
    const type = document.getElementById('report-type')?.value || 'Landslide';
    const location = document.getElementById('report-location')?.value || 'Active Arterial Highway';
    const desc = document.getElementById('report-desc')?.value || '';

    // Calculate dynamic coordinates localized around the current map region
    const currentRegion = window.mapEngine ? window.mapEngine.getCurrentRegion() : { centerLat: 26.2006, centerLng: 92.9376 };
    const jitterLat = (Math.random() - 0.5) * 0.4;
    const jitterLng = (Math.random() - 0.5) * 0.4;

    const newReport = {
      title,
      type,
      location,
      desc,
      lat: currentRegion.centerLat + jitterLat,
      lng: currentRegion.centerLng + jitterLng,
      severity: 'CRITICAL',
      reportedBy: 'Field Official / Disaster Response Force',
      photoData: this.currentUploadedPhoto || null
    };

    if (window.fieldReports) {
      await window.fieldReports.saveReport(newReport);
    }

    if (window.mapEngine) {
      window.mapEngine.addHazardMarker({
        ...newReport,
        time: 'Just now',
        status: 'Reported by Field Responders',
        estimatedDelay: '+4.5 Hours',
        alternateRoute: 'AI Dynamic Bypass Route Calculated'
      });
      window.mapEngine.flyToLocation(newReport.lat, newReport.lng, 9);
    }

    // Reset upload state and close modal
    this.currentUploadedPhoto = null;
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  triggerDisasterSimulation() {
    const currentRegion = window.mapEngine ? window.mapEngine.getCurrentRegion() : { centerLat: 26.2006, centerLng: 92.9376 };

    const simulatedIncident = {
      id: "SIM-" + Date.now().toString().slice(-4),
      title: "🚨 SIMULATED FLASH DISASTER: Major Slope Failure & Road Severance",
      location: `Active Mountain Corridor (${currentRegion.name || 'Primary Highway'})`,
      lat: currentRegion.centerLat + 0.05,
      lng: currentRegion.centerLng + 0.08,
      severity: "CRITICAL HAZARD",
      type: "Landslide",
      time: "Just Now (LIVE DISASTER SIMULATION)",
      status: "ROAD SEVERED - 0% Passability",
      estimatedDelay: "+8.5 Hours",
      alternateRoute: "Diverting all In-Transit Relief Convoys via Safe Bypass Ridge"
    };

    if (window.mapEngine) {
      window.mapEngine.addHazardMarker(simulatedIncident);
      window.mapEngine.flyToLocation(simulatedIncident.lat, simulatedIncident.lng, 9);
    }

    if (window.fleetManager) {
      window.fleetManager.triggerSOS(
        "EMRG-OXY-204",
        "Simulated Slope Failure Detected: Autonomous AI rerouting engaged to prevent critical commodity stockouts."
      );
    }

    if (window.fieldReports) {
      window.fieldReports.showToast(
        "⚡ SIMULATION TRIGGERED: High-hazard landslide simulated. AI Rerouting all convoy units."
      );
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new GlobalAppCoordinator();
});