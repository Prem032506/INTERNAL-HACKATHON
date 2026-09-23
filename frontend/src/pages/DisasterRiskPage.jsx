import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Flame,
  Droplets,
  CloudRain,
  Activity,
  Layers,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { api } from '../services/api';

export default function DisasterRiskPage({ disasters = [], alerts = [], onRefresh }) {
  const [selectedType, setSelectedType] = useState('ALL');

  const disasterTypes = [
    'ALL',
    'Landslide',
    'Flood',
    'Heavy Rainfall',
    'Road Blockage',
    'Bridge Risk',
    'Infrastructure Failure'
  ];

  const filteredDisasters = disasters.filter((d) => {
    if (selectedType === 'ALL') return true;
    return d.type.toLowerCase() === selectedType.toLowerCase();
  });

  return (
    <div className="page-container">
      {/* Header Overview Card */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <AlertTriangle size={20} color="#f97316" />
            <span>DISASTER & HAZARD INTELLIGENCE (NER CORRIDORS)</span>
          </div>
          <span className="badge badge-orange">LIVE HAZARD MONITORING</span>
        </div>

        {/* Hazard Category Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
          {disasterTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={selectedType === type ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Disasters Incident Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {filteredDisasters.map((item) => (
          <div key={item.disaster_id} className="glass-panel" style={{
            borderLeft: `4px solid ${
              item.severity === 'CRITICAL' ? 'var(--danger-red)' :
              item.severity === 'HIGH' ? 'var(--hazard-orange)' : 'var(--warning-amber)'
            }`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <span className={`badge ${item.severity === 'CRITICAL' ? 'badge-red' : 'badge-orange'}`}>
                  {item.type.toUpperCase()}: {item.severity}
                </span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: '6px' }}>
                  {item.location}
                </h3>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                {item.reported_at}
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.45, marginBottom: '12px' }}>
              {item.description}
            </p>

            <div style={{
              padding: '8px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '0.74rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>State:</span>
                <strong style={{ color: '#f8fafc' }}>{item.state}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Affected Highway:</span>
                <strong style={{ color: '#38bdf8' }}>{item.affected_route}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Operational Status:</span>
                <span style={{ color: item.status === 'Active' ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
