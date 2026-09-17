/**
 * Global GIS Map Engine for Mountain & Vulnerable Geographies
 * Powered by Leaflet.js with multi-region switching (NER, Himalayas, Alps, Andes)
 */

class GlobalMapEngine {
  constructor(mapContainerId = 'ner-gis-map') {
    this.mapContainerId = mapContainerId;
    this.map = null;
    this.corridorLayers = L.layerGroup();
    this.hazardLayers = L.layerGroup();
    this.fleetLayers = L.layerGroup();
    this.hubLayers = L.layerGroup();
    this.routePolylineLayers = L.layerGroup();
    this.allRegionsData = [];
    this.currentRegionId = 'NER_INDIA';
  }

  async initialize() {
    // Initial Center on North Eastern Region / Global Default
    this.map = L.map(this.mapContainerId, {
      center: [26.2006, 92.9376],
      zoom: 7,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false
    });

    // Custom Top-Right Zoom Control
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // OpenStreetMap HOT Tile Layer - No API Key Required
    this.baseTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Add Layer Groups
    this.corridorLayers.addTo(this.map);
    this.hazardLayers.addTo(this.map);
    this.fleetLayers.addTo(this.map);
    this.hubLayers.addTo(this.map);
    this.routePolylineLayers.addTo(this.map);

    await this.loadGlobalRegionsData();
    this.switchRegion('NER_INDIA');
    this.bindFleetTracking();
  }

  setBasemap(mode) {
    if (this.baseTileLayer) this.map.removeLayer(this.baseTileLayer);

    if (mode === 'satellite') {
      this.baseTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri, Earthstar Geographics'
      }).addTo(this.map);

    } else if (mode === 'terrain') {
      this.baseTileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM'
      }).addTo(this.map);

    } else {
      // OpenStreetMap HOT - No API Key Required
      this.baseTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);
    }
  }

  async loadGlobalRegionsData() {
    try {
      const resp = await fetch('assets/data/global-regions.json');
      const data = await resp.json();
      this.allRegionsData = data.regions || [];
    } catch (e) {
      console.warn('Fallback loading global regions', e);
    }
  }

  switchRegion(regionId) {
    const region = this.allRegionsData.find(r => r.id === regionId);
    if (!region) return;

    this.currentRegionId = regionId;

    // Clear previous layers
    this.corridorLayers.clearLayers();
    this.hubLayers.clearLayers();
    this.hazardLayers.clearLayers();
    this.routePolylineLayers.clearLayers();

    // Smooth camera transition to target region
    this.map.flyTo([region.centerLat, region.centerLng], region.zoom, {
      animate: true,
      duration: 1.8
    });

    // Render Hubs
    (region.hubs || []).forEach(hub => {
      const customIcon = L.divIcon({
        className: 'custom-hub-marker',
        html: `<div class="hub-dot"></div><div class="hub-label">${hub.name}</div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([hub.lat, hub.lng], { icon: customIcon });

      marker.bindPopup(`
        <div class="custom-popup-box">
          <div class="popup-header">
            <span class="popup-title">${hub.name}</span>
            <span class="popup-badge normal">Strategic Hub</span>
          </div>

          <div class="popup-body">
            International Supply Chain Depot in ${region.country}.
          </div>
        </div>
      `);

      this.hubLayers.addLayer(marker);
    });

    // If Andes Corridor, load all 50 South American Andes Landmarks
    if (regionId === 'ANDES_CORRIDOR') {
      this.loadAndes50Landmarks();
    }

    // Render Corridors
    (region.corridors || []).forEach(corridor => {
      let color = '#00f2fe';
      let dashArray = null;

      if (corridor.riskLevel === 'Critical') {
        color = '#ef4444';
        dashArray = '6, 8';
      } else if (corridor.riskLevel === 'High') {
        color = '#f59e0b';
      }

      const polyline = L.polyline(corridor.coordinates, {
        color: color,
        weight: 4,
        opacity: 0.85,
        dashArray: dashArray,
        lineJoin: 'round'
      });

      polyline.bindPopup(`
        <div class="custom-popup-box">
          <div class="popup-header">
            <span class="popup-title">${corridor.name}</span>
            <span class="popup-badge ${corridor.riskLevel.toLowerCase()}">${corridor.riskLevel}</span>
          </div>

          <div class="popup-body">
            <strong>Category:</strong> ${corridor.type}<br>
            <strong>Region:</strong> ${region.name}
          </div>
        </div>
      `);

      this.corridorLayers.addLayer(polyline);
    });

    // Update District / Area List Sidebar
    if (window.app) {
      window.app.renderDistrictList(region.states);
    }

    // Filter fleet telemetry for current region
    if (window.fleetManager) {
      window.fleetManager.filterByRegion(regionId);
    }
  }

  async loadAndes50Landmarks() {
    try {
      const resp = await fetch('assets/data/andes-landmarks.json');
      const data = await resp.json();
      const landmarks = data.landmarks || [];

      landmarks.forEach(lm => {
        let iconEmoji = '🏔️';
        if (lm.category.includes('Port')) iconEmoji = '⚓';
        else if (lm.category.includes('Capital') || lm.category.includes('City') || lm.category.includes('Urban')) iconEmoji = '🏢';
        else if (lm.category.includes('Pass') || lm.category.includes('Tunnel')) iconEmoji = '🛣️';
        else if (lm.category.includes('Ski') || lm.category.includes('Resort')) iconEmoji = '⛷️';
        else if (lm.category.includes('Reservoir') || lm.category.includes('Lake') || lm.category.includes('Dam')) iconEmoji = '🌊';
        else if (lm.category.includes('Mining')) iconEmoji = '⛏️';
        else if (lm.category.includes('Volcanic')) iconEmoji = '🌋';

        const customIcon = L.divIcon({
          className: 'custom-andes-landmark',
          html: `
            <div style="background:rgba(15,23,42,0.9);border:1px solid #38bdf8;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:0.85rem;box-shadow:0 0 10px rgba(56,189,248,0.4);">
              ${iconEmoji}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker([lm.lat, lm.lng], { icon: customIcon });

        marker.bindPopup(`
          <div class="custom-popup-box" style="min-width:240px;">
            <div class="popup-header">
              <span class="popup-title">${iconEmoji} ${lm.name}</span>
              <span class="popup-badge normal">${lm.elevation}m</span>
            </div>

            <div class="popup-body">
              <strong>Country / State:</strong> ${lm.country} (${lm.region})<br>
              <strong>Classification:</strong> ${lm.category}<br>
              <strong>Corridor:</strong> ${lm.route}<br>
              <strong>Terrain / Hazard:</strong> <span style="color:#f59e0b;">${lm.hazard}</span><br>
              <p style="margin-top:6px;font-size:0.75rem;color:#cbd5e1;line-height:1.3;">
                ${lm.desc}
              </p>
            </div>
          </div>
        `);

        this.hubLayers.addLayer(marker);
      });
    } catch (e) {
      console.warn("Could not load Andes landmarks:", e);
    }
  }

  addHazardMarker(inc) {
    const isFlood = inc.type && inc.type.toLowerCase().includes('flood');

    const customIcon = L.divIcon({
      className: `custom-hazard-marker ${isFlood ? 'hazard-flood' : ''}`,
      html: `
        <div class="hazard-pulse-ring"></div>
        <div class="hazard-icon-bubble">${isFlood ? '🌊' : '⚠️'}</div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    const marker = L.marker([inc.lat, inc.lng], { icon: customIcon });

    marker.bindPopup(`
      <div class="custom-popup-box">
        <div class="popup-header">
          <span class="popup-title">${inc.title}</span>
          <span class="popup-badge critical">${inc.severity}</span>
        </div>

        <div class="popup-body">
          <strong>Location:</strong> ${inc.location}<br>
          <strong>Status:</strong>
          <span style="color:#ef4444;font-weight:700;">
            ${inc.status}
          </span><br>

          <strong>Delay:</strong>
          ${inc.estimatedDelay || '+4.5 Hrs'}<br>

          <div class="popup-meta-row">
            <span>Alternate:</span><br>
            <strong style="color:#38bdf8;">
              ${inc.alternateRoute || 'AI Recalculating'}
            </strong>
          </div>
        </div>
      </div>
    `);

    this.hazardLayers.addLayer(marker);
  }

  bindFleetTracking() {
    if (!window.fleetManager) return;

    window.fleetManager.subscribe((vehicles) => {
      this.fleetLayers.clearLayers();

      vehicles.forEach(veh => {
        const isSOS = veh.sos;

        const iconSymbol = window.fleetManager.getVehicleIcon(veh.category);

        const customIcon = L.divIcon({
          className: 'custom-vehicle-marker',
          html: `
            <div class="vehicle-icon-bubble ${isSOS ? 'sos' : ''}" style="font-size:1.1rem;display:flex;align-items:center;justify-content:center;">
              ${iconSymbol}
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([veh.lat, veh.lng], {
          icon: customIcon
        });

        marker.bindPopup(`
          <div class="custom-popup-box">
            <div class="popup-header">
              <span class="popup-title">${veh.id}</span>
              <span class="popup-badge ${isSOS ? 'critical' : 'normal'}">
                ${veh.category}
              </span>
            </div>

            <div class="popup-body">
              <strong>Driver / Registered Owner:</strong> ${veh.name}<br>
              <strong>Region / Sector:</strong> <span style="color:var(--neon-cyan);">${veh.region}</span><br>
              <strong>Cargo:</strong> ${veh.cargo}<br>

              <strong>Speed:</strong> ${veh.speedKmH} km/h |
              <strong>Status:</strong> <span style="color:var(--neon-emerald);font-weight:bold;">${veh.eta}</span><br>

              ${veh.tempCelsius !== undefined
                ? `<strong>Cold-Chain Temp:</strong>
                   <span style="color:#10b981;font-weight:bold;">
                     ${veh.tempCelsius}°C
                   </span><br>`
                : ''}

              ${isSOS
                ? `<div style="margin-top:6px;padding:6px;background:rgba(239,68,68,0.2);border-radius:6px;color:#fca5a5;border:1px solid #ef4444;">
                     ⚠️ <strong>SOS ALERT:</strong> ${veh.sosReason}
                   </div>`
                : ''}
            </div>

            <button class="popup-action-btn" onclick="window.app.showRoutePlanner('Guwahati', 'Kohima', '${veh.category}')">
              Optimize Active Route
            </button>
          </div>
        `);

        this.fleetLayers.addLayer(marker);
      });
    });
  }

  drawRouteComparison(primaryCoords, alternateCoords) {
    this.routePolylineLayers.clearLayers();

    const primaryLine = L.polyline(primaryCoords, {
      color: '#ef4444',
      weight: 5,
      dashArray: '8, 8',
      opacity: 0.9
    });

    const alternateLine = L.polyline(alternateCoords, {
      color: '#00f2fe',
      weight: 6,
      opacity: 1
    });

    this.routePolylineLayers.addLayer(primaryLine);
    this.routePolylineLayers.addLayer(alternateLine);

    const group = L.featureGroup([
      primaryLine,
      alternateLine
    ]);

    this.map.fitBounds(group.getBounds(), {
      padding: [40, 40]
    });
  }

  flyToLocation(lat, lng, zoom = 9) {
    if (this.map) {
      this.map.flyTo([lat, lng], zoom, {
        animate: true,
        duration: 1.5
      });
    }
  }
}

window.mapEngine = new GlobalMapEngine();