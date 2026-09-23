import React, { useState } from 'react';
import {
  Map,
  Filter,
  Search,
  Layers,
  Compass,
  CheckSquare,
  Square
} from 'lucide-react';
import NERMap from '../components/NERMap';

export default function LiveMapPage({ mapData, onNavigateToRouting }) {
  const [filterAccessible, setFilterAccessible] = useState(true);
  const [filterRestricted, setFilterRestricted] = useState(true);
  const [filterHighRisk, setFilterHighRisk] = useState(true);
  const [filterBlocked, setFilterBlocked] = useState(true);
  const [filterDisasters, setFilterDisasters] = useState(true);
  const [filterReports, setFilterReports] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoad, setSelectedRoad] = useState(null);

  const allRoads = mapData?.roads || [];
  const filteredRoads = allRoads.filter((r) => {
    if (r.road_status === 'ACCESSIBLE' && !filterAccessible) return false;
    if (r.road_status === 'RESTRICTED' && !filterRestricted) return false;
    if (r.road_status === 'HIGH_RISK' && !filterHighRisk) return false;
    if (r.road_status === 'BLOCKED' && !filterBlocked) return false;
    if (searchTerm) {
      const match = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.destination.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="page-container">
      {/* Header Bar with Filter Toggles */}
      <div className="glass-panel" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Map size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>NER LIVE GIS MAP INTELLIGENCE</h2>
          </div>

          {/* Quick Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterAccessible}
                onChange={(e) => setFilterAccessible(e.target.checked)}
              />
              <span style={{ color: '#10b981' }}>🟢 Accessible</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterRestricted}
                onChange={(e) => setFilterRestricted(e.target.checked)}
              />
              <span style={{ color: '#f59e0b' }}>🟡 Restricted</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterHighRisk}
                onChange={(e) => setFilterHighRisk(e.target.checked)}
              />
              <span style={{ color: '#f97316' }}>🟠 High Risk</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterBlocked}
                onChange={(e) => setFilterBlocked(e.target.checked)}
              />
              <span style={{ color: '#ef4444' }}>🔴 Blocked</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterDisasters}
                onChange={(e) => setFilterDisasters(e.target.checked)}
              />
              <span>⚠ Disasters</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterReports}
                onChange={(e) => setFilterReports(e.target.checked)}
              />
              <span>📍 Reports</span>
            </label>
          </div>
        </div>
      </div>

      {/* Map and Road List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Full Interactive Map */}
        <NERMap
          roads={filteredRoads}
          locations={mapData?.locations || []}
          disasters={filterDisasters ? (mapData?.disasters || []) : []}
          fieldReports={filterReports ? (mapData?.field_reports || []) : []}
          onSelectRoad={(road) => setSelectedRoad(road)}
          onSelectForRouting={(src, dst) => onNavigateToRouting(src, dst)}
          height="620px"
        />

        {/* Sidebar Road Inspector List */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '620px', padding: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
              MONITORED HIGHWAYS ({filteredRoads.length})
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', top: '10px', left: '10px' }} />
              <input
                type="text"
                placeholder="Search highway or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '32px', fontSize: '0.8rem', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredRoads.map((road) => (
              <div
                key={road.road_id}
                onClick={() => setSelectedRoad(road)}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: selectedRoad?.road_id === road.road_id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${selectedRoad?.road_id === road.road_id ? 'rgba(6, 182, 212, 0.4)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>
                    {road.name}
                  </span>
                  <span className={`badge ${
                    road.road_status === 'ACCESSIBLE' ? 'badge-green' :
                    road.road_status === 'RESTRICTED' ? 'badge-yellow' :
                    road.road_status === 'HIGH_RISK' ? 'badge-orange' : 'badge-red'
                  }`} style={{ fontSize: '0.65rem', padding: '2px 5px' }}>
                    {road.road_status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>
                  <span>{road.source} → {road.destination}</span>
                  <span>{road.distance_km} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#38bdf8', marginTop: '4px' }}>
                  <span>AI Risk: <strong>{road.risk_score || 35}/100</strong></span>
                  <span>Rain: {road.rainfall_mm} mm</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
