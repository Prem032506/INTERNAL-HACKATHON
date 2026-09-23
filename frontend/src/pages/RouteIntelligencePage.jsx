import React, { useState, useEffect } from 'react';
import {
  Navigation,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  Clock,
  MapPin,
  TrendingDown,
  Layers,
  Sparkles,
  Truck
} from 'lucide-react';
import { api } from '../services/api';
import NERMap from '../components/NERMap';

export default function RouteIntelligencePage({
  locations = [],
  roads = [],
  initialOrigin = '',
  initialDestination = ''
}) {
  const [origin, setOrigin] = useState(initialOrigin || 'Guwahati');
  const [destination, setDestination] = useState(initialDestination || 'Imphal');
  const [vehicleType, setVehicleType] = useState('Heavy Commercial');
  const [priority, setPriority] = useState('EMERGENCY');

  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // Run initial route calculation for default pair
    if (origin && destination && origin !== destination) {
      handleCalculateRoute();
    }
  }, []);

  const handleCalculateRoute = async () => {
    if (origin === destination) {
      setErrorMsg('Origin and Destination must be distinct locations.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.optimizeRoute({
        origin,
        destination,
        vehicle_type: vehicleType,
        priority
      });
      setRouteResult(res);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to calculate route.');
    } finally {
      setLoading(false);
    }
  };

  const aiRoute = routeResult?.ai_recommended;
  const directRoute = routeResult?.direct_shortest;

  return (
    <div className="page-container">
      {/* Configuration Form Card */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Navigation size={20} color="#38bdf8" />
            <span>AI MULTI-FACTOR ROUTE OPTIMIZATION (DIJKSTRA / A*)</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
            Cost = Distance + Travel Time + AI Risk Penalty + Road Blockage Penalty
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div className="form-group">
            <label className="form-label">ORIGIN HUB</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="form-control"
            >
              {locations.map((loc) => (
                <option key={loc.location_id} value={loc.name}>
                  {loc.name} ({loc.state})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">DESTINATION HUB</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="form-control"
            >
              {locations.map((loc) => (
                <option key={loc.location_id} value={loc.name}>
                  {loc.name} ({loc.state})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">VEHICLE TYPE</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="form-control"
            >
              <option value="Heavy Commercial">Heavy Commercial (Truck / Hauler)</option>
              <option value="Medium Truck">Medium Truck (6-Wheeler)</option>
              <option value="Emergency 4x4">Emergency 4x4 (Relief Scout / Ambulance)</option>
              <option value="Light Relief Van">Light Relief Van</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">MISSION PRIORITY</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="form-control"
            >
              <option value="EMERGENCY">EMERGENCY (Disaster Relief / Medical)</option>
              <option value="HIGH">HIGH (Essential Supplies / Food)</option>
              <option value="NORMAL">NORMAL (Standard Commercial Freight)</option>
              <option value="LOW">LOW (Non-Urgent Logistics)</option>
            </select>
          </div>

          <button
            onClick={handleCalculateRoute}
            disabled={loading}
            className="btn-primary"
            style={{ height: '42px', justifyContent: 'center' }}
          >
            <Sparkles size={16} />
            <span>{loading ? 'CALCULATING...' : 'OPTIMIZE ROUTE'}</span>
          </button>
        </div>

        {errorMsg && (
          <div style={{ marginTop: '14px', color: '#f87171', fontSize: '0.84rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      {/* AI Recommendation Verdict Banner */}
      {routeResult?.verdict && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '10px',
          background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.12) 0%, rgba(14, 165, 233, 0.05) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Shield size={22} color="#38bdf8" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 500 }}>
            <strong style={{ color: '#38bdf8' }}>AI Logistics Decision: </strong>
            {routeResult.verdict}
          </div>
        </div>
      )}

      {/* Comparison Grid */}
      {routeResult && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* AI Recommended Route Card */}
          <div className="glass-panel" style={{
            borderColor: 'rgba(56, 189, 248, 0.4)',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.12)'
          }}>
            <div className="panel-header">
              <div className="panel-title" style={{ color: '#38bdf8' }}>
                <CheckCircle size={18} color="#38bdf8" />
                <span>AI RECOMMENDED SAFEST ROUTE</span>
              </div>
              <span className="badge badge-blue">RECOMMENDED</span>
            </div>

            {aiRoute ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Distance</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{aiRoute.distance_km} km</div>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Est. Travel Time</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{aiRoute.travel_time_hours} hrs</div>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Avg AI Risk Score</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: aiRoute.avg_risk_score > 60 ? '#f97316' : '#10b981' }}>
                      {aiRoute.avg_risk_score}/100
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.08)' }}>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Total Calculated Route Cost:</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    {aiRoute.route_cost.toLocaleString()}
                  </span>
                </div>

                {/* Turn-by-turn Waypoints */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Waypoints Corridor:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    {aiRoute.nodes.map((node, i) => (
                      <React.Fragment key={i}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.05)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#f8fafc'
                        }}>
                          {node}
                        </span>
                        {i < aiRoute.nodes.length - 1 && (
                          <ArrowRight size={13} color="#38bdf8" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#94a3b8' }}>No safe route found.</p>
            )}
          </div>

          {/* Direct Shortest Route Card */}
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title" style={{ color: '#94a3b8' }}>
                <Clock size={18} color="#94a3b8" />
                <span>DIRECT SHORTEST DISTANCE ROUTE</span>
              </div>
              <span className="badge badge-yellow">BASELINE</span>
            </div>

            {directRoute ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Distance</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{directRoute.distance_km} km</div>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Est. Travel Time</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{directRoute.travel_time_hours} hrs</div>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Avg AI Risk Score</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: directRoute.avg_risk_score > 60 ? '#ef4444' : '#f59e0b' }}>
                      {directRoute.avg_risk_score}/100
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)' }}>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Direct Calculated Cost:</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                    {directRoute.route_cost.toLocaleString()}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Waypoints Corridor:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    {directRoute.nodes.map((node, i) => (
                      <React.Fragment key={i}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.05)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#f8fafc'
                        }}>
                          {node}
                        </span>
                        {i < directRoute.nodes.length - 1 && (
                          <ArrowRight size={13} color="#94a3b8" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#94a3b8' }}>No direct route available.</p>
            )}
          </div>
        </div>
      )}

      {/* Visual GIS Route Overlay Map */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div className="panel-header" style={{ marginBottom: '12px' }}>
          <div className="panel-title">
            <Layers size={18} color="#38bdf8" />
            <span>AI RECOMMENDED ROUTE CORRIDOR (BLUE HIGHLIGHT)</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
            {aiRoute ? `${aiRoute.nodes[0]} ➔ ${aiRoute.nodes[aiRoute.nodes.length - 1]}` : ''}
          </span>
        </div>

        <NERMap
          roads={roads}
          locations={locations}
          highlightedRoute={aiRoute}
          height="450px"
        />
      </div>
    </div>
  );
}
