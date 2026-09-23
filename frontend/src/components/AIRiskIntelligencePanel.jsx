import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function AIRiskIntelligencePanel({ selectedRoad, onPredictionResult }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState({
    risk_score: 78,
    risk_level: 'HIGH',
    confidence: 86.4,
    risk_factors: [
      'Heavy rainfall exceeding 180 mm on saturated hill slopes',
      'Degraded asphalt with recurring rockfall vulnerability',
      'High incident history (16 past road blockages recorded)'
    ],
    recommendation: 'Use alternative regional bypass. Restrict heavy commercial haulage convoys.'
  });

  // When a road is clicked on the map, run real-time inference on its features
  useEffect(() => {
    if (selectedRoad) {
      runInferenceForRoad(selectedRoad);
    }
  }, [selectedRoad]);

  const runInferenceForRoad = async (roadData) => {
    setLoading(true);
    try {
      const res = await api.predictRisk(roadData);
      setPrediction(res);
      if (onPredictionResult) onPredictionResult(res);
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'var(--danger-red)';
      case 'HIGH': return 'var(--hazard-orange)';
      case 'MODERATE': return 'var(--warning-amber)';
      default: return 'var(--safe-green)';
    }
  };

  return (
    <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background glow accent */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '180px',
        height: '180px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="panel-header">
        <div className="panel-title">
          <BrainCircuit size={19} color="#38bdf8" />
          <span>AI RISK INTELLIGENCE</span>
        </div>

        {selectedRoad && (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Evaluating: <strong style={{ color: '#f8fafc' }}>{selectedRoad.name}</strong>
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'center' }}>
        {/* Score & Level Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)'
        }}>
          {/* Gauge circle representation */}
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: `conic-gradient(${getLevelColor(prediction.risk_level)} ${prediction.risk_score * 3.6}deg, rgba(255, 255, 255, 0.08) 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 16px ${getLevelColor(prediction.risk_level)}33`
          }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
                {prediction.risk_score}
              </span>
              <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>/100</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              RISK LEVEL
            </div>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: getLevelColor(prediction.risk_level),
              margin: '2px 0'
            }}>
              {prediction.risk_level}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 600 }}>
              Confidence: {prediction.confidence}%
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>
            Risk Factors:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {prediction.risk_factors?.map((factor, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '0.78rem',
                color: '#e2e8f0'
              }}>
                <span style={{ color: getLevelColor(prediction.risk_level), fontSize: '0.9rem', lineHeight: '1rem' }}>•</span>
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable AI Recommendation Box */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        borderRadius: '8px',
        background: 'rgba(6, 182, 212, 0.08)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Sparkles size={18} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
            AI Actionable Recommendation
          </div>
          <div style={{ fontSize: '0.84rem', color: '#f8fafc', marginTop: '2px', lineHeight: 1.4 }}>
            {prediction.recommendation}
          </div>
        </div>
      </div>
    </div>
  );
}
