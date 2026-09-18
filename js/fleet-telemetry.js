/**
 * Real-Time Essential Commodity Fleet Telemetry & GPS Tracking Engine
 * Dual-Mode: Live Flask Backend Telemetry with Seamless Offline Mock Fallback
 */

class FleetTelemetryManager {
  constructor() {
    this.vehicles = [];
    this.subscribers = [];
    this.timer = null;
    this.isBackendConnected = false;
  }

  async initialize() {
    // 1. First, load the rich baseline fleet telemetry
    await this.loadBaselineFleet();

    // 2. Try to seamlessly connect with local backend (with short timeout)
    await this.tryConnectBackend();

    // 3. Render fleet panel and start simulation loop
    this.updateFleetPanel();
    this.startLiveSimulation();
    this.notifySubscribers();
  }

  async loadBaselineFleet() {
    try {
      const resp = await fetch('assets/data/mock-telemetry.json');
      if (resp.ok) {
        const data = await resp.json();
        this.vehicles = (data.fleetVehicles || []).map(v => ({
          id: v.id,
          name: v.name,
          category: v.category || 'MEDICAL',
          cargo: v.cargo || 'Essential Cargo',
          driver: v.driver,
          contact: v.contact,
          origin: v.origin,
          destination: v.destination,
          lat: v.lat,
          lng: v.lng,
          speedKmH: v.speedKmH || 45,
          eta: v.eta || 'In-Transit',
          tempCelsius: v.tempCelsius,
          tempStatus: v.tempStatus,
          sos: Boolean(v.sos),
          sosReason: v.sosReason || null,
          path: v.path || []
        }));
        return;
      }
    } catch (e) {
      console.warn('[Telemetry] Loading local baseline file failed, using memory defaults:', e);
    }

    // High-fidelity fallback if fetch fails completely (e.g. file:// protocol)
    this.vehicles = [
      {
        id: 'UN-MED-101',
        name: 'WHO Cold-Chain Reefer #1',
        category: 'MEDICAL',
        cargo: '3,200 Vials Critical Vaccines (2-8°C)',
        driver: 'Tsering Dorjee',
        contact: '+91 98621 44510',
        origin: 'Guwahati Gateway Depot',
        destination: 'Itanagar Civil Hospital',
        lat: 26.3500,
        lng: 92.1000,
        speedKmH: 48,
        eta: '18:45 Local',
        tempCelsius: 4.2,
        tempStatus: 'Optimal (2-8°C)',
        sos: false
      },
      {
        id: 'EMRG-OXY-204',
        name: 'Cryo Liquid Medical Oxygen Tanker',
        category: 'MEDICAL',
        cargo: '18.5 MT Liquid Medical O2 (-183°C)',
        driver: 'Rajen Bora',
        contact: '+91 94350 88219',
        origin: 'Numaligarh Oxygen Plant',
        destination: 'Kohima District Hospital',
        lat: 25.8200,
        lng: 93.8500,
        speedKmH: 22,
        eta: '22:15 Local (+5.5h delay)',
        tempCelsius: -183.0,
        tempStatus: 'Cryo-Stable',
        sos: true,
        sosReason: 'Pagala Pahar mudslide detected. AI rerouting via secondary ridge.'
      },
      {
        id: 'WFP-FOOD-309',
        name: 'WFP Food Security Grain Convoy',
        category: 'FOOD_SECURITY',
        cargo: '450 Quintals Fortified Rice & Wheat',
        driver: 'Biplab Debbarma',
        contact: '+91 87941 12093',
        origin: 'Siliguri Food Silo',
        destination: 'Gangtok Civil Depot',
        lat: 26.9200,
        lng: 88.4800,
        speedKmH: 38,
        eta: '20:30 Local',
        tempCelsius: 24.5,
        sos: false
      },
      {
        id: 'RESCUE-007',
        name: 'NDRF Disaster Rapid Response Unit',
        category: 'EMERGENCY',
        cargo: 'Satellite Comms & Inflatable Boats',
        driver: 'Sub-Inspector M. K. Sharma',
        contact: '+91 94361 77102',
        origin: 'Regional Response Base',
        destination: 'Disaster Sector Base',
        lat: 26.8500,
        lng: 88.4500,
        speedKmH: 54,
        eta: '19:10 Local',
        tempCelsius: 21.0,
        sos: false
      }
    ];
  }

  async tryConnectBackend() {
    // Skip local HTTP backend call if running on HTTPS (Netlify / Vercel / GitHub Pages)
    if (window.location.protocol === 'https:') return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const response = await fetch('http://127.0.0.1:5000/vehicles', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) return;

      const backendVehicles = await response.json();
      if (Array.isArray(backendVehicles) && backendVehicles.length > 0) {
        this.isBackendConnected = true;
        console.log(`[Telemetry] Connected to Flask backend! Loaded ${backendVehicles.length} vehicles.`);

        // Merge backend registered vehicles with existing telemetry
        backendVehicles.forEach((bv, idx) => {
          const existing = this.vehicles.find(v => v.id === bv.vehicle_number);
          if (existing) {
            existing.driver = bv.driver_name || existing.driver;
            existing.cargo = bv.cargo || existing.cargo;
          } else {
            this.vehicles.push({
              id: bv.vehicle_number,
              name: `${bv.vehicle_type} (${bv.driver_name})`,
              category: bv.vehicle_type.includes('Med') || bv.vehicle_type.includes('Reefer') ? 'MEDICAL' : 'EMERGENCY',
              cargo: bv.cargo || 'Essential Relief Commodities',
              driver: bv.driver_name,
              contact: bv.contact || '',
              lat: bv.lat || (26.1445 + (idx * 0.08)),
              lng: bv.lng || (91.7362 + (idx * 0.08)),
              speedKmH: 42,
              eta: 'Active Live Feed',
              tempCelsius: bv.vehicle_type.includes('Reefer') ? 4.2 : undefined,
              sos: false
            });
          }
        });
      }
    } catch (e) {
      // Graceful offline operation - perfectly normal when backend isn't running
      this.isBackendConnected = false;
      console.log('[Telemetry] Operating in Standalone Offline-Resilient Telemetry Mode.');
    }
  }

  startLiveSimulation() {
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.vehicles.forEach(vehicle => {
        // Subtle realistic GPS motion along corridor
        const jitterLat = (Math.random() - 0.48) * 0.002;
        const jitterLng = (Math.random() - 0.48) * 0.002;
        vehicle.lat += jitterLat;
        vehicle.lng += jitterLng;

        // Dynamic speed simulation
        vehicle.speedKmH = Math.max(15, Math.min(65, Math.round(vehicle.speedKmH + (Math.random() * 4 - 2))));

        // Temperature micro-fluctuations (for cold-chain monitoring)
        if (vehicle.tempCelsius !== undefined && vehicle.tempCelsius > 0) {
          vehicle.tempCelsius = parseFloat((4.0 + (Math.random() * 0.6 - 0.3)).toFixed(1));
        }
      });

      this.updateFleetPanel();
      this.notifySubscribers();
    }, 3500);
  }

  updateFleetPanel() {
    const fleetFeed = document.getElementById('fleet-telemetry-feed');
    if (!fleetFeed) return;

    if (this.vehicles.length === 0) {
      fleetFeed.innerHTML = `
        <div class="telemetry-card">
          <div class="truck-header">
            <span class="truck-id">No Vehicles</span>
          </div>
          <p style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">No active supply convoys in database.</p>
        </div>
      `;
      return;
    }

    fleetFeed.innerHTML = '';

    this.vehicles.forEach(vehicle => {
      const card = document.createElement('div');
      card.className = `telemetry-card ${vehicle.sos ? 'sos-card' : ''}`;
      if (vehicle.sos) {
        card.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        card.style.background = 'rgba(239, 68, 68, 0.08)';
      }

      const tempBadge = vehicle.tempCelsius !== undefined
        ? `<span>Temp: <strong style="color:${vehicle.tempCelsius < 8 ? 'var(--neon-emerald)' : 'var(--neon-crimson)'};">${vehicle.tempCelsius}°C</strong></span>`
        : '';

      const badgeColor = vehicle.category === 'MEDICAL' 
        ? 'var(--neon-cyan)' 
        : (vehicle.category === 'EMERGENCY' ? 'var(--neon-crimson)' : 'var(--neon-amber)');

      card.innerHTML = `
        <div class="truck-header">
          <span class="truck-id" style="${vehicle.sos ? 'color:var(--neon-crimson);font-weight:800;' : ''}">
            ${vehicle.id} ${vehicle.sos ? '(SOS)' : ''}
          </span>
          <span class="cargo-tag" style="background:rgba(255,255,255,0.06);color:${badgeColor};border:1px solid ${badgeColor}33;">
            ${vehicle.category}
          </span>
        </div>
        <div class="truck-route" style="font-size:0.75rem;color:var(--text-secondary);margin:4px 0;">
          ${vehicle.origin || 'Depot'} ➔ ${vehicle.destination || 'Terminal'}
        </div>
        <div class="truck-meta">
          <span>Speed: <strong>${vehicle.speedKmH} km/h</strong></span>
          ${tempBadge}
          <span>ETA: <strong>${vehicle.eta}</strong></span>
        </div>
        ${vehicle.sos ? `
          <p style="font-size:0.7rem;color:#fca5a5;margin-top:6px;line-height:1.3;">
            ⚠️ <strong>SOS ALERT:</strong> ${vehicle.sosReason || 'Mountain slope hazard ahead. AI rerouting engaged.'}
          </p>
        ` : ''}
      `;

      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        if (window.mapEngine) {
          window.mapEngine.flyToLocation(vehicle.lat, vehicle.lng, 9);
        }
      });

      fleetFeed.appendChild(card);
    });
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.vehicles);
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => cb(this.vehicles));
  }

  getVehicleById(id) {
    return this.vehicles.find(v => v.id === id || v.id.includes(id));
  }

  triggerSOS(vehicleId, reason) {
    // Match exact or partial ID (e.g. "NER-OXY-204" or "OXY-204")
    const vehicle = this.getVehicleById(vehicleId) || this.vehicles.find(v => v.category === 'MEDICAL');
    if (vehicle) {
      vehicle.sos = true;
      vehicle.sosReason = reason || 'Hazard alert detected ahead. Autonomous AI bypass route active.';
      this.updateFleetPanel();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  resolveSOS(vehicleId) {
    const vehicle = this.getVehicleById(vehicleId);
    if (vehicle) {
      vehicle.sos = false;
      vehicle.sosReason = null;
      this.updateFleetPanel();
      this.notifySubscribers();
      return true;
    }
    return false;
  }
}

window.fleetManager = new FleetTelemetryManager();