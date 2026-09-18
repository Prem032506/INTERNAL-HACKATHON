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
  }

  getCurrentRegion() {
    return this.allRegionsData.find(r => r.id === this.currentRegionId) || this.allRegionsData[0] || { centerLat: 26.2006, centerLng: 92.9376 };
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

    const photoHtml = inc.photoData 
      ? `<div style="margin-top:8px;"><img src="${inc.photoData}" alt="Incident Photo Evidence" style="width:100%;max-height:120px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,0.2);"></div>`
      : '';

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

          <div class="popup-meta-row" style="margin-top:4px;">
            <span>Alternate:</span><br>
            <strong style="color:#38bdf8;">
              ${inc.alternateRoute || 'AI Recalculating'}
            </strong>
          </div>
          ${photoHtml}
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

        const iconSymbol =
          veh.category === 'MEDICAL'
            ? '💉'
            : (veh.category === 'FUEL'
              ? '⛽'
              : (veh.category === 'EMERGENCY'
                ? '🚨'
                : '🚚'));

        const customIcon = L.divIcon({
          className: 'custom-vehicle-marker',
          html: `
            <div class="vehicle-icon-bubble ${isSOS ? 'sos' : ''}">
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
              <span class="popup-title">${veh.id} - ${veh.name}</span>
              <span class="popup-badge ${isSOS ? 'critical' : 'medical'}">
                ${veh.category}
              </span>
            </div>

            <div class="popup-body">
              <strong>Cargo:</strong> ${veh.cargo}<br>

              <strong>Speed:</strong> ${veh.speedKmH} km/h |
              <strong>ETA:</strong> ${veh.eta}<br>

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

            <button class="popup-action-btn" onclick="window.app.showRoutePlanner()">
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