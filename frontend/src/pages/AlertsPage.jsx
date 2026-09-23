import React, { useState, useEffect } from 'react';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  RotateCw,
  MapPin,
  Clock,
  Filter
} from 'lucide-react';
import { api } from '../services/api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await api.resolveAlert(alertId);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity.toUpperCase() === filterSeverity;
  });

  return (
    <div className="page-container">
      {/* Header Panel */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Bell size={20} color="#f97316" />
            <span>DISASTER EMERGENCY BROADCAST & ALERT CENTER</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="badge-source">SQLITE DATABASE PERSISTED</span>
            <button
              onClick={fetchAlerts}
              disabled={loading}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={filterSeverity === sev ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '0.76rem' }}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
            <div>No active alerts in this category. All corridors operational.</div>
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`glass-panel ${alt.status === 'ACTIVE' && alt.severity === 'CRITICAL' ? 'pulsing-alert' : ''}`}
              style={{
                borderLeft: `5px solid ${
                  alt.severity === 'CRITICAL' ? 'var(--danger-red)' :
                  alt.severity === 'HIGH' ? 'var(--hazard-orange)' : 'var(--warning-amber)'
                }`,
                opacity: alt.status === 'RESOLVED' ? 0.65 : 1
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge ${
                    alt.severity === 'CRITICAL' ? 'badge-red' :
                    alt.severity === 'HIGH' ? 'badge-orange' : 'badge-yellow'
                  }`}>
                    {alt.severity}
                  </span>
                  <span className="badge badge-blue">{alt.category}</span>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>
                    {alt.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    {alt.timestamp}
                  </span>
                  {alt.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleResolve(alt.id)}
                      className="btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                    >
                      Mark Resolved
                    </button>
                  ) : (
                    <span className="badge badge-green">RESOLVED</span>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: '10px 0', lineHeight: 1.45 }}>
                {alt.description}
              </p>

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.74rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                <div>Location: <strong style={{ color: '#f8fafc' }}>{alt.location}</strong></div>
                {alt.affected_road && (
                  <div>Highway Sector: <strong style={{ color: '#38bdf8' }}>{alt.affected_road}</strong></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
