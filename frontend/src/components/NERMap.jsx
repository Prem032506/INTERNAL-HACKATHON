import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Navigation,
  CloudRain,
  Mountain,
  Compass,
  CheckCircle2,
  XCircle,
  X,
  Layers,
  Eye,
  Globe
} from 'lucide-react';
import { getRoadCoordinates, REAL_HIGHWAY_WAYPOINTS } from '../map/roadCoordinates';

// Real-world map providers including authentic Google Maps Physical Terrain and Traffic Roads
const MAP_LAYERS = {
  google_terrain: {
    name: 'Google Maps Terrain (Physical & Mountains)',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps &mdash; Physical Terrain, Elevation Contours & Road Network',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  },
  google_roads: {
    name: 'Google Maps Traffic & Roads',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps &mdash; Live Road & Traffic Network',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  },
  google_hybrid: {
    name: 'Google Maps Satellite Hybrid',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps &mdash; Satellite Imagery & Highway Overlays',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  },
  esri_topo: {
    name: 'Esri Mountain Shaded Relief',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Topographic Relief Shading',
    maxZoom: 19
  }
};

// Custom sleek Leaflet divIcons for hubs, disasters, and field reports
const createHubIcon = (name, isHub) => {
  return L.divIcon({
    className: 'custom-hub-pin',
    html: `
      <div style="
        background: ${isHub ? '#0284c7' : '#1e293b'};
        border: 2px solid #ffffff;
        color: white;
        border-radius: 50%;
        width: 14px;
        height: 14px;
        box-shadow: 0 0 10px ${isHub ? 'rgba(56, 189, 248, 0.9)' : 'rgba(0,0,0,0.6)'};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 5px; height: 5px; border-radius: 50%; background: #ffffff;"></div>
      </div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const createDisasterIcon = (type) => {
  return L.divIcon({
    className: 'custom-disaster-pin',
    html: `
      <div style="
        background: #ef4444;
        border: 2px solid #ffffff;
        color: white;
        border-radius: 6px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 800;
        box-shadow: 0 0 16px rgba(239, 68, 68, 0.9);
      ">⚠</div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const createReportIcon = () => {
  return L.divIcon({
    className: 'custom-report-pin',
    html: `
      <div style="
        background: #f59e0b;
        border: 2px solid #ffffff;
        color: #0f172a;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 800;
        box-shadow: 0 0 12px rgba(245, 158, 11, 0.9);
      ">📍</div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

export default function NERMap({
  roads = [],
  locations = [],
  disasters = [],
  fieldReports = [],
  highlightedRoute = null,
  onSelectRoad = null,
  onSelectForRouting = null,
  height = '540px'
}) {
  // Default to Google Maps Physical Terrain showing realistic mountain relief & highways
  const [activeLayerKey, setActiveLayerKey] = useState('google_terrain');
  const [selectedRoad, setSelectedRoad] = useState(null);

  const getRoadColor = (status) => {
    switch (status) {
      case 'ACCESSIBLE': return '#10b981'; // Green
      case 'RESTRICTED': return '#f59e0b'; // Amber / Yellow
      case 'HIGH_RISK': return '#f97316';  // Orange
      case 'BLOCKED': return '#ef4444';    // Red
      default: return '#0284c7';
    }
  };

  const handleRoadClick = (road) => {
    setSelectedRoad(road);
    if (onSelectRoad) onSelectRoad(road);
  };

  const activeLayer = MAP_LAYERS[activeLayerKey] || MAP_LAYERS.google_terrain;

  return (
    <div className="map-wrapper" style={{ height, position: 'relative' }}>
      {/* Map Layer Switcher Toolbar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '52px',
        zIndex: 1000,
        display: 'flex',
        gap: '6px',
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '8px',
        padding: '4px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
      }}>
        <button
          onClick={() => setActiveLayerKey('google_terrain')}
          className={activeLayerKey === 'google_terrain' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '5px 11px', fontSize: '0.72rem', height: '28px', gap: '5px' }}
          title="Google Maps Physical Terrain (Elevation Shading, Mountains & Highway Routes)"
        >
          <Mountain size={13} />
          <span>Google Terrain (Mountains)</span>
        </button>

        <button
          onClick={() => setActiveLayerKey('google_roads')}
          className={activeLayerKey === 'google_roads' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '5px 11px', fontSize: '0.72rem', height: '28px', gap: '5px' }}
          title="Google Maps Standard Traffic Road Network"
        >
          <Navigation size={13} />
          <span>Google Roads & Traffic</span>
        </button>

        <button
          onClick={() => setActiveLayerKey('google_hybrid')}
          className={activeLayerKey === 'google_hybrid' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '5px 11px', fontSize: '0.72rem', height: '28px', gap: '5px' }}
          title="Google Maps Satellite Hybrid"
        >
          <Globe size={13} />
          <span>Google Satellite</span>
        </button>

        <button
          onClick={() => setActiveLayerKey('esri_topo')}
          className={activeLayerKey === 'esri_topo' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '5px 11px', fontSize: '0.72rem', height: '28px', gap: '5px' }}
          title="Esri Topographic Shaded Relief"
        >
          <Compass size={13} />
          <span>Esri Shaded Relief</span>
        </button>
      </div>

      <MapContainer
        center={[26.15, 92.6]}
        zoom={7}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Real-time Google Maps & Topo Tile Layer */}
        <TileLayer
          key={activeLayerKey}
          attribution={activeLayer.attribution}
          url={activeLayer.url}
          maxZoom={activeLayer.maxZoom}
          subdomains={activeLayer.subdomains || ['a', 'b', 'c']}
        />

        {/* 1. Real National Highway Routes following actual mountain geography */}
        {roads.map((road) => {
          const coords = getRoadCoordinates(road);
          const color = getRoadColor(road.road_status);
          const isSelected = selectedRoad?.road_id === road.road_id;

          return (
            <React.Fragment key={road.road_id}>
              {/* High-contrast dark casing underlay so highways are crisp against mountains */}
              <Polyline
                positions={coords}
                pathOptions={{
                  color: '#0f172a',
                  weight: isSelected ? 8 : (road.road_status === 'BLOCKED' ? 6 : 5),
                  opacity: 0.85
                }}
              />
              {/* Colored status line following real highway curves */}
              <Polyline
                positions={coords}
                pathOptions={{
                  color: color,
                  weight: isSelected ? 5 : (road.road_status === 'BLOCKED' ? 4 : 3.5),
                  opacity: 1,
                  dashArray: road.road_status === 'BLOCKED' ? '6, 6' : undefined
                }}
                eventHandlers={{
                  click: () => handleRoadClick(road)
                }}
              >
                <Tooltip sticky>
                  <div style={{ fontSize: '0.8rem', padding: '2px', color: '#0f172a' }}>
                    <strong>{road.name}</strong>
                    <div style={{ color: color, fontWeight: 700 }}>
                      Status: {road.road_status} | AI Risk: {road.risk_score || 35}/100
                    </div>
                    <div>Distance: {road.distance_km} km | Rain: {road.rainfall_mm} mm</div>
                    <div>Terrain: {road.terrain} | Elevation: {road.elevation_m}m</div>
                  </div>
                </Tooltip>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* 2. Highlighted Route (Blue glowing corridor following realistic Highway curves) */}
        {highlightedRoute?.edges?.map((edge, idx) => {
          const coords = getRoadCoordinates(edge);
          return (
            <React.Fragment key={`hl-edge-${idx}`}>
              <Polyline
                positions={coords}
                pathOptions={{
                  color: '#0284c7',
                  weight: 10,
                  opacity: 0.6
                }}
              />
              <Polyline
                positions={coords}
                pathOptions={{
                  color: '#38bdf8',
                  weight: 5,
                  opacity: 1,
                  lineCap: 'round',
                  lineJoin: 'round',
                  dashArray: '2, 6'
                }}
              />
            </React.Fragment>
          );
        })}

        {/* 3. Location Hub Markers */}
        {locations.map((loc) => (
          <Marker
            key={loc.location_id}
            position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
            icon={createHubIcon(loc.name, loc.is_hub == 1)}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              <div style={{ fontSize: '0.78rem', color: '#0f172a' }}>
                <strong>{loc.name}</strong> ({loc.state})
                <div>Elevation: {loc.elevation_m}m | District: {loc.district}</div>
                <div>Emergency Contact: {loc.contact_number}</div>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* 4. Disaster Markers */}
        {disasters.map((dis) => (
          <Marker
            key={dis.disaster_id}
            position={[parseFloat(dis.latitude), parseFloat(dis.longitude)]}
            icon={createDisasterIcon(dis.type)}
          >
            <Popup>
              <div style={{ color: '#0f172a', maxWidth: '240px', fontSize: '0.8rem' }}>
                <strong style={{ color: '#dc2626' }}>{dis.type}: {dis.severity}</strong>
                <p style={{ marginTop: '4px' }}>{dis.description}</p>
                <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#64748b' }}>
                  Route: {dis.affected_route}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 5. Field Incident Reports Markers */}
        {fieldReports.map((rep) => {
          const repLat = rep.latitude || 25.8;
          const repLon = rep.longitude || 93.2;
          return (
            <Marker
              key={`rep-${rep.id}`}
              position={[parseFloat(repLat), parseFloat(repLon)]}
              icon={createReportIcon()}
            >
              <Popup>
                <div style={{ color: '#0f172a', maxWidth: '220px', fontSize: '0.8rem' }}>
                  <strong>Field Incident: {rep.issue_type}</strong>
                  <div style={{ color: '#d97706', fontWeight: 600 }}>Severity: {rep.severity}</div>
                  <p style={{ marginTop: '4px' }}>{rep.description}</p>
                  <small style={{ color: '#64748b' }}>Location: {rep.location}</small>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#10b981' }}></div>
          <span>🟢 Accessible</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#f59e0b' }}></div>
          <span>🟡 Restricted</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#f97316' }}></div>
          <span>🟠 High-Risk</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ef4444' }}></div>
          <span>🔴 Blocked</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#38bdf8' }}></div>
          <span>🔵 Recommended Route</span>
        </div>
      </div>

      {/* Selected Road Detail Floating Panel */}
      {selectedRoad && (
        <div style={{
          position: 'absolute',
          top: '52px',
          right: '20px',
          width: '320px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '16px',
          zIndex: 1000,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          color: '#f8fafc'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38bdf8' }}>
              {selectedRoad.name}
            </h4>
            <button
              onClick={() => setSelectedRoad(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', margin: '10px 0', alignItems: 'center' }}>
            <span className={`badge ${
              selectedRoad.road_status === 'ACCESSIBLE' ? 'badge-green' :
              selectedRoad.road_status === 'RESTRICTED' ? 'badge-yellow' :
              selectedRoad.road_status === 'HIGH_RISK' ? 'badge-orange' : 'badge-red'
            }`}>
              {selectedRoad.road_status}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Risk: <strong>{selectedRoad.risk_score || 35}/100</strong> ({selectedRoad.risk_level || 'LOW'})
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: '#cbd5e1' }}>
            <div>Distance: <strong>{selectedRoad.distance_km} km</strong></div>
            <div>Rainfall: <strong>{selectedRoad.rainfall_mm} mm</strong></div>
            <div>Terrain: <strong>{selectedRoad.terrain}</strong></div>
            <div>Elevation: <strong>{selectedRoad.elevation_m} m</strong></div>
          </div>

          <div style={{ marginTop: '12px', padding: '8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.72rem' }}>
            <strong style={{ color: '#38bdf8' }}>AI Actionable Guidance:</strong>
            <p style={{ marginTop: '4px', color: '#e2e8f0' }}>
              {selectedRoad.road_status === 'BLOCKED'
                ? 'Impassable. Divert logistics convoys through alternate state corridors.'
                : selectedRoad.road_status === 'HIGH_RISK'
                ? 'High disaster risk. Restrict heavy vehicles; deploy pilot vehicle.'
                : 'Sector clear for standard commercial and relief shipments.'}
            </p>
          </div>

          {onSelectForRouting && (
            <button
              onClick={() => onSelectForRouting(selectedRoad.source, selectedRoad.destination)}
              className="btn-primary"
              style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              <Navigation size={14} />
              <span>Route Through This Link</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
