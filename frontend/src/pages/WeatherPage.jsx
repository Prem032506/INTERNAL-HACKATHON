import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Gauge,
  Sun,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { api } from '../services/api';

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await api.getWeather();
      setWeatherData(res);
    } catch (err) {
      console.error('Failed to load weather:', err);
    } finally {
      setLoading(false);
    }
  };

  const stations = weatherData?.stations || [];

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <CloudRain size={20} color="#38bdf8" />
            <span>NER REGIONAL METEOROLOGICAL INTELLIGENCE</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge-source">DATA SOURCE: LOCAL DATASET</span>
            <span className="badge badge-blue">LOCAL DATASET / MODEL PREDICTION</span>
            {weatherData?.is_simulating && (
              <span className="badge badge-orange">SIMULATION MODE ACTIVE</span>
            )}
            <button
              onClick={fetchWeather}
              disabled={loading}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            >
              <RotateCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>
          Continuous rainfall and atmospheric pressure monitoring across 15 high-risk North Eastern districts. High precipitation directly correlates with mountain slope saturation and triggers automated ML risk escalation.
        </p>
      </div>

      {/* Weather Station Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {stations.map((st) => (
          <div key={st.location_id} className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderTop: `3px solid ${
              st.alert_level === 'WARNING' ? 'var(--danger-red)' :
              st.alert_level === 'ALERT' ? 'var(--hazard-orange)' :
              st.alert_level === 'WATCH' ? 'var(--warning-amber)' : 'var(--safe-green)'
            }`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  {st.location_name}
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#38bdf8' }}>{st.state}</span>
              </div>
              <span className={`badge ${
                st.alert_level === 'WARNING' ? 'badge-red' :
                st.alert_level === 'ALERT' ? 'badge-orange' :
                st.alert_level === 'WATCH' ? 'badge-yellow' : 'badge-green'
              }`}>
                {st.alert_level}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Thermometer size={24} color="#f59e0b" />
                <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  {st.temp_c}°C
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 500 }}>
                {st.condition}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                <CloudRain size={15} color="#38bdf8" />
                <span>Rain: <strong style={{ color: '#38bdf8' }}>{st.rainfall_mm} mm</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                <Droplets size={15} color="#06b6d4" />
                <span>Humidity: <strong>{st.humidity_pct}%</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                <Wind size={15} color="#94a3b8" />
                <span>Wind: <strong>{st.wind_speed_kmh} km/h</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                <Eye size={15} color="#94a3b8" />
                <span>Visibility: <strong>{st.visibility_km} km</strong></span>
              </div>
            </div>

            <div style={{ fontSize: '0.68rem', color: '#64748b', textAlign: 'right', marginTop: '4px' }}>
              Refreshed: {st.last_updated}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
