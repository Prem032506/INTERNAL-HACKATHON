/**
 * Global Coordinator & UI Logic for Global-Setu
 */

class GlobalAppCoordinator {
  constructor() {
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

        document
          .querySelectorAll('.map-control-btn[data-layer]')
          .forEach(b => b.classList.remove('active'));

        btn.classList.add('active');

        const layer = btn.getAttribute('data-layer');

        window.mapEngine.setBasemap(layer);
      });

    });

    // Vehicle Registry Lookup Modal Triggers
    const lookupBtn = document.getElementById('btn-open-vehicle-lookup');
    const lookupModal = document.getElementById('vehicle-lookup-modal');

    if (lookupBtn && lookupModal) {
      lookupBtn.addEventListener('click', () => {
        lookupModal.classList.add('active');
        document.getElementById('vehicle-lookup-input')?.focus();
      });
    }

    // Quick Sample Buttons
    document.querySelectorAll('.quick-plate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const plate = btn.getAttribute('data-plate');
        const input = document.getElementById('vehicle-lookup-input');
        if (input) {
          input.value = plate;
          this.handleVehicleLookup(plate);
        }
      });
    });

    // Vehicle Lookup Form Submit
    const lookupForm = document.getElementById('vehicle-lookup-form');
    if (lookupForm) {
      lookupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('vehicle-lookup-input');
        if (input && input.value.trim()) {
          this.handleVehicleLookup(input.value.trim());
        }
      });
    }

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
        document
          .querySelectorAll('.lang-card')
          .forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        langModal.classList.remove('active');
      });
    });

    // Close Modals on backdrop click or close button
    document
      .querySelectorAll('.modal-close, .modal-backdrop')
      .forEach(el => {
        el.addEventListener('click', (e) => {
          if (
            e.target === el ||
            el.classList.contains('modal-close')
          ) {
            document
              .querySelectorAll('.modal-backdrop')
              .forEach(m => m.classList.remove('active'));
          }
        });
      });

    // Disruption Simulator Button
    const simulateBtn =
      document.getElementById('btn-simulate-disruption');

    if (simulateBtn) {

      simulateBtn.addEventListener('click', () => {
        this.triggerDisasterSimulation();
      });

    }

    // Route Optimizer Form
    const routeForm =
      document.getElementById('route-planner-form');

    if (routeForm) {

      routeForm.addEventListener('submit', (e) => {

        e.preventDefault();

        this.handleRouteOptimization();

      });

    }

    // Field Report Form
    const reportForm =
      document.getElementById('field-incident-form');

    if (reportForm) {

      reportForm.addEventListener('submit', (e) => {

        e.preventDefault();

        this.handleFieldReportSubmission();

      });

    }

  }

  showRoutePlanner(
    origin = 'Guwahati',
    dest = 'Kohima',
    cargo = 'MEDICAL'
  ) {

    const modal =
      document.getElementById('route-optimizer-modal');

    const originSelect =
      document.getElementById('route-origin');

    const destSelect =
      document.getElementById('route-dest');

    const cargoSelect =
      document.getElementById('route-cargo');

    if (originSelect) {
      originSelect.value = origin;
    }

    if (destSelect) {
      destSelect.value = dest;
    }

    if (cargoSelect) {
      cargoSelect.value = cargo;
    }

    if (modal) {
      modal.classList.add('active');
    }

    this.handleRouteOptimization();

  }

  showFieldReportModal() {
    const modal = document.getElementById('field-report-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  async handleVehicleLookup(queryPlate) {
    const resultBox = document.getElementById('vehicle-lookup-result');
    if (!resultBox) return;

    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <div style="text-align:center;padding:12px;color:var(--neon-cyan);">
        <span>⏳ Querying Master Vehicle Registry...</span>
      </div>
    `;

    try {
      // 1. Try Flask Backend
      let data = null;
      try {
        const response = await fetch("http://127.0.0.1:5000/vehicle-owner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicle_number: queryPlate })
        });
        if (response.ok) {
          data = await response.json();
        }
      } catch (beErr) {
        console.warn("Backend lookup unreachable, using client fleet index:", beErr);
      }

      // 2. Client fallback lookup
      if (!data && window.fleetManager) {
        const v = window.fleetManager.getVehicleById(queryPlate);
        if (v) {
          data = {
            vehicle_number: v.id,
            vehicle_type: v.category,
            owner_name: v.name,
            region: v.region,
            lat: v.lat,
            lng: v.lng,
            status: "Active / Verified in Registry",
            source: "Client Telemetry Index"
          };
        }
      }

      if (data) {
        const iconEmoji = window.fleetManager?.getVehicleIcon(data.vehicle_type) || '🚚';
        const vLat = data.lat || (window.fleetManager?.getVehicleById(data.vehicle_number)?.lat) || 0;
        const vLng = data.lng || (window.fleetManager?.getVehicleById(data.vehicle_number)?.lng) || 0;

        resultBox.innerHTML = `
          <div style="display:flex;align-items:flex-start;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:0.6rem;margin-bottom:0.6rem;">
            <div>
              <span style="font-size:1.15rem;font-weight:800;color:var(--neon-cyan);letter-spacing:0.04em;">
                ${iconEmoji} ${data.vehicle_number}
              </span>
              <span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:4px;background:rgba(16,185,129,0.15);color:var(--neon-emerald);font-size:0.75rem;font-weight:700;">
                ✓ Verified Registry
              </span>
            </div>
            <span style="font-size:0.8rem;color:var(--text-secondary);">${data.region || 'Global'}</span>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;font-size:0.82rem;margin-bottom:0.75rem;">
            <div>
              <span style="color:var(--text-secondary);display:block;font-size:0.72rem;">REGISTERED PERSON / DRIVER</span>
              <strong style="color:#fff;font-size:0.92rem;">${data.owner_name}</strong>
            </div>
            <div>
              <span style="color:var(--text-secondary);display:block;font-size:0.72rem;">VEHICLE TYPE</span>
              <strong style="color:var(--neon-amber);">${data.vehicle_type}</strong>
            </div>
            <div>
              <span style="color:var(--text-secondary);display:block;font-size:0.72rem;">REGIONAL JURISDICTION</span>
              <strong style="color:#93c5fd;">${data.region || 'Active Jurisdiction'}</strong>
            </div>
            <div>
              <span style="color:var(--text-secondary);display:block;font-size:0.72rem;">DATA SOURCE</span>
              <strong style="color:#cbd5e1;">${data.source || 'Master DB'}</strong>
            </div>
          </div>

          ${vLat && vLng ? `
            <button type="button" id="btn-locate-looked-vehicle" class="btn-primary-action" style="width:100%;font-size:0.85rem;padding:0.45rem;">
              <span>🗺️</span> Locate & Track On GIS Map
            </button>
          ` : ''}
        `;

        const locateBtn = document.getElementById('btn-locate-looked-vehicle');
        if (locateBtn && vLat && vLng) {
          locateBtn.addEventListener('click', () => {
            // Close modal
            document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));

            // Fly to location
            if (window.mapEngine) {
              window.mapEngine.flyToLocation(vLat, vLng, 12);
            }
          });
        }
      } else {
        resultBox.innerHTML = `
          <div style="text-align:center;padding:10px;color:#fca5a5;">
            <span>⚠️ Vehicle <strong>"${queryPlate}"</strong> was not found in the registry.</span>
            <p style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">
              Please check the plate format (e.g. UK-01-AB-1021, HP-01-A-1021, JK-01-AB-1021, AB 102 AA, AB-CD-21, OD 18 AB 1021).
            </p>
          </div>
        `;
      }
    } catch (err) {
      resultBox.innerHTML = `
        <div style="text-align:center;padding:10px;color:#ef4444;">
          <span>Error processing lookup: ${err.message}</span>
        </div>
      `;
    }
  }

  // Route Optimization using Flask Backend
  async handleRouteOptimization() {

    const origin =
      document.getElementById('route-origin')?.value ||
      'Guwahati';

    const dest =
      document.getElementById('route-dest')?.value ||
      'Kohima';

    const cargo =
      document.getElementById('route-cargo')?.value ||
      'MEDICAL';

    const container =
      document.getElementById('route-results-container');

    if (!container) return;

    try {

      // Send route information to Flask backend
      const response = await fetch(
        "http://127.0.0.1:5000/optimize-route",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            deliveries: [
              {
                delivery_id: 1,
                origin: origin,
                destination: dest,
                cargo: cargo
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error("Route backend connection failed");
      }

      const backendResult = await response.json();

      console.log(
        "Route optimization result from backend:",
        backendResult
      );

      /*
       * Keep the existing frontend AI result.
       * This provides the route information and coordinates
       * used by the existing route display.
       */

      const result =
        window.aiEngine.optimizeRoute(
          origin,
          dest,
          cargo
        );

      container.innerHTML = `

        <div class="route-card disrupted">

          <div class="route-header">

            <span
              class="route-name"
              style="color:#ef4444;"
            >
              ⚠️ Standard Direct: ${result.primary.name}
            </span>

            <span class="status-badge badge-critical">
              ${result.primary.status}
            </span>

          </div>

          <div class="route-stats-grid">

            <div class="stat-item">
              <span class="stat-label">
                Distance
              </span>

              <span class="stat-val">
                ${result.primary.distanceKm} km
              </span>
            </div>

            <div class="stat-item">

              <span class="stat-label">
                Est. Time
              </span>

              <span
                class="stat-val"
                style="color:#ef4444;"
              >
                ${result.primary.totalTimeHours} hrs
              </span>

            </div>

            <div class="stat-item">

              <span class="stat-label">
                Delay
              </span>

              <span class="stat-val">
                +${result.primary.weatherDelayHours} hrs
              </span>

            </div>

            <div class="stat-item">

              <span class="stat-label">
                Hazard Risk
              </span>

              <span
                class="stat-val"
                style="color:#ef4444;"
              >
                ${result.primary.hazardRisk}
              </span>

            </div>

          </div>

        </div>

        <div class="route-card selected">

          <div class="route-header">

            <span
              class="route-name"
              style="color:#00f2fe;"
            >
              ✨ AI Optimized: ${result.alternate.name}
            </span>

            <span class="status-badge badge-normal">
              ${result.alternate.status}
            </span>

          </div>

          <div class="route-stats-grid">

            <div class="stat-item">

              <span class="stat-label">
                Distance
              </span>

              <span class="stat-val">
                ${result.alternate.distanceKm} km
              </span>

            </div>

            <div class="stat-item">

              <span class="stat-label">
                Est. Time
              </span>

              <span
                class="stat-val"
                style="color:#10b981;"
              >
                ${result.alternate.totalTimeHours} hrs
              </span>

            </div>

            <div class="stat-item">

              <span class="stat-label">
                Time Saved
              </span>

              <span
                class="stat-val"
                style="color:#00f2fe;"
              >
                -${(
                  result.primary.totalTimeHours -
                  result.alternate.totalTimeHours
                ).toFixed(1)} hrs
              </span>

            </div>

            <div class="stat-item">

              <span class="stat-label">
                Hazard Risk
              </span>

              <span
                class="stat-val"
                style="color:#10b981;"
              >
                ${result.alternate.hazardRisk}
              </span>

            </div>

          </div>

          <p
            style="
              font-size:0.75rem;
              color:#94a3b8;
              margin-top:4px;
            "
          >
            <strong>Cargo Protocol:</strong>
            ${result.cargoAdvisory}
          </p>

        </div>

      `;

      // Draw the existing red dotted and blue optimized routes
      window.mapEngine.drawRouteComparison(
        result.primary.coordinates,
        result.alternate.coordinates
      );

    } catch (error) {

      console.error(
        "Route optimization error:",
        error
      );

      container.innerHTML = `
        <div class="route-card disrupted">

          <div class="route-header">

            <span
              class="route-name"
              style="color:#ef4444;"
            >
              ⚠️ Backend Connection Error
            </span>

            <span class="status-badge badge-critical">
              ERROR
            </span>

          </div>

          <p
            style="
              font-size:0.75rem;
              color:#94a3b8;
              margin-top:6px;
            "
          >
            Could not connect to the Flask route
            optimization service.
          </p>

        </div>
      `;

    }

  }

  async handleFieldReportSubmission() {

    const title =
      document.getElementById('report-title')?.value ||
      'Corridor Blockage';

    const type =
      document.getElementById('report-type')?.value ||
      'Landslide';

    const location =
      document.getElementById('report-location')?.value ||
      'Mountain Pass Disruption';

    const desc =
      document.getElementById('report-desc')?.value ||
      '';

    const newReport = {

      title,

      type,

      location,

      desc,

      lat:
        25.8000 +
        (Math.random() - 0.5) * 0.5,

      lng:
        93.9000 +
        (Math.random() - 0.5) * 0.5,

      severity: 'CRITICAL',

      reportedBy:
        'Field Official / Global Responders'

    };

    if (window.fieldReports) {

      await window.fieldReports.saveReport(
        newReport
      );

    }

    if (window.mapEngine) {

      window.mapEngine.addHazardMarker({

        ...newReport,

        time: 'Just now',

        status:
          'Reported by Field Responders',

        estimatedDelay:
          '+5.0 Hours',

        alternateRoute:
          'Recalculating via AI bypass...'

      });

    }

    document
      .querySelectorAll('.modal-backdrop')
      .forEach(m =>
        m.classList.remove('active')
      );

  }

  triggerDisasterSimulation() {

    const simulatedIncident = {

      id:
        "SIM-" +
        Date.now()
          .toString()
          .slice(-4),

      title:
        "🚨 SIMULATED FLASH DISASTER: Major Mountain Landslide Blockage",

      location:
        "Active High-Hazard Transit Stretch",

      lat: 25.7950,

      lng: 93.9350,

      severity:
        "CRITICAL HAZARD",

      type:
        "Landslide",

      time:
        "Just Now (LIVE SIMULATION)",

      status:
        "ROAD SEVERED - 0% Passability",

      estimatedDelay:
        "+8.5 Hours",

      alternateRoute:
        "Diverting all In-Transit Supply Vehicles via Safe Bypass"

    };

    window.mapEngine.addHazardMarker(
      simulatedIncident
    );

    window.mapEngine.flyToLocation(
      25.7950,
      93.9350,
      9
    );

    if (window.fleetManager) {

      window.fleetManager.triggerSOS(
        "NER-OXY-204",
        "Simulated Hazard: Mountain slope failure detected ahead. AI automatic rerouting engaged."
      );

    }

    if (window.fieldReports) {

      window.fieldReports.showToast(
        "⚡ SIMULATION TRIGGERED: High-hazard landslide simulated. AI Rerouting all convoy units."
      );

    }

  }

}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    window.app = new GlobalAppCoordinator();
  }
);