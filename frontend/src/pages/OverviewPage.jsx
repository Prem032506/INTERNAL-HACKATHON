import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Truck,
  Activity,
  Layers,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import NERMap from '../components/NERMap';
import AIRiskIntelligencePanel from '../components/AIRiskIntelligencePanel';
import AIModelStatusCard from '../components/AIModelStatusCard';

export default function OverviewPage({
  mapData,
  onNavigateToRouting,
  onModelUpdated
}) {
  const [selectedRoad, setSelectedRoad] = useState(null);

  const kpis = mapData?.kpis || {
    roads_monitored: 24,
    accessible_roads: 14,
    restricted_roads: 4,
    critical_roads: 6,
    active_alerts: 5,
    high_risk_zones: 6,
    active_logistics: 8,
    ai_predictions: 96
  };

  return (
    <div className="page-container">
      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Roads Monitored</span>
            <Layers size={18} color="#38bdf8" />
          </div>
          <div className="kpi-value">{kpis.roads_monitored}</div>
          <div className="kpi-subtext">8 NER States Interlinked</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Accessible Roads</span>
            <CheckCircle size={18} color="#10b981" />
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>{kpis.accessible_roads}</div>
          <div className="kpi-subtext">Safe For Logistics Transit</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Restricted Roads</span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>{kpis.restricted_roads}</div>
          <div className="kpi-subtext">Speed & Weight Penalties</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Critical / Blocked</span>
            <ShieldAlert size={18} color="#ef4444" />
          </div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>{kpis.critical_roads}</div>
          <div className="kpi-subtext">Impassable; Reroute Required</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Active Alerts</span>
            <AlertTriangle size={18} color="#f97316" />
          </div>
          <div className="kpi-value" style={{ color: '#f97316' }}>{kpis.active_alerts}</div>
          <div className="kpi-subtext">Disaster Warning Broadcasts</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Active Logistics</span>
            <Truck size={18} color="#38bdf8" />
          </div>
          <div className="kpi-value">{kpis.active_logistics}</div>
          <div className="kpi-subtext">Convoys Under AI Monitoring</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">AI Predictions</span>
            <Activity size={18} color="#06b6d4" />
          </div>
          <div className="kpi-value" style={{ color: '#06b6d4' }}>{kpis.ai_predictions}</div>
          <div className="kpi-subtext">Multi-Factor Inferenced</div>
        </div>
      </div>

      {/* Main Map & AI Risk Intelligence Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Left Column: NER GIS Map */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div className="panel-header" style={{ marginBottom: '12px' }}>
            <div className="panel-title">
              <MapPin size={18} color="#38bdf8" />
              <span>NORTH EASTERN REGION (NER) GIS MAP</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Click any road segment to inspect AI risk metrics
            </span>
          </div>

          <NERMap
            roads={mapData?.roads || []}
            locations={mapData?.locations || []}
            disasters={mapData?.disasters || []}
            fieldReports={mapData?.field_reports || []}
            onSelectRoad={(road) => setSelectedRoad(road)}
            onSelectForRouting={(src, dst) => onNavigateToRouting(src, dst)}
            height="460px"
          />
        </div>

        {/* Right Column: AI Risk Intelligence Panel & Model Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AIRiskIntelligencePanel
            selectedRoad={selectedRoad}
          />

          <AIModelStatusCard
            onModelUpdated={onModelUpdated}
          />
        </div>
      </div>

      {/* Recent Disasters & Emergency Broadcast Feed */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <ShieldAlert size={18} color="#ef4444" />
            <span>CRITICAL DISASTER HAZARDS & ACTIVE FIELD INCIDENTS</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Live SQLite Database Feed
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          {(mapData?.disasters || []).slice(0, 4).map((d) => (
            <div key={d.disaster_id} style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${d.severity === 'CRITICAL' ? 'badge-red' : 'badge-orange'}`}>
                  {d.type.toUpperCase()}: {d.severity}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{d.reported_at}</span>
              </div>
              <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>{d.location}</strong>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>{d.description}</p>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '4px' }}>
                Affected: {d.affected_route}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
