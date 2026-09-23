import React, { useState, useEffect } from 'react';
import {
  Cpu,
  RefreshCw,
  Play,
  RotateCcw,
  CheckCircle,
  AlertOctagon,
  Layers,
  Calendar,
  Activity
} from 'lucide-react';
import { api } from '../services/api';

export default function AIModelStatusCard({ onModelUpdated }) {
  const [modelStatus, setModelStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.getMLStatus();
      setModelStatus(res);
    } catch (err) {
      console.error('Failed to load ML status:', err);
    }
  };

  const handleTrain = async () => {
    setLoading(true);
    setMsg('Retraining Random Forest Classifier on local dataset...');
    try {
      const res = await api.trainMLModel();
      setModelStatus(res.metadata);
      setMsg(`Success: Model retrained! Accuracy: ${res.metadata.accuracy_pct}%`);
      if (onModelUpdated) onModelUpdated();
    } catch (err) {
      setMsg(`Error training model: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReload = async () => {
    setLoading(true);
    setMsg('Reloading model weights into memory...');
    try {
      const res = await api.reloadMLModel();
      setModelStatus(res.metadata);
      setMsg('Model successfully reloaded!');
      if (onModelUpdated) onModelUpdated();
    } catch (err) {
      setMsg(`Error reloading model: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPrediction = async () => {
    setLoading(true);
    setMsg('Running test inference for high-altitude monsoon pass...');
    try {
      const testRoad = {
        rainfall_mm: 215,
        road_condition: 'Severe',
        elevation_m: 1650,
        terrain: 'Mountainous',
        landslide_history: 1,
        traffic_density: 'High',
        infrastructure_rating: 4.2
      };
      const res = await api.predictRisk(testRoad);
      setMsg(`Prediction executed: Risk Score ${res.risk_score}/100 [${res.risk_level}] (Confidence: ${res.confidence}%)`);
    } catch (err) {
      setMsg(`Inference error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Cpu size={19} color="#38bdf8" />
          <span>AI MODEL STATUS</span>
        </div>

        {modelStatus?.status === 'TRAINED & READY' ? (
          <span className="badge badge-green">
            <CheckCircle size={12} />
            <span>MODEL ONLINE</span>
          </span>
        ) : (
          <span className="badge badge-yellow">
            <AlertOctagon size={12} />
            <span>{modelStatus?.status || 'PENDING'}</span>
          </span>
        )}
      </div>

      {modelStatus?.error_message ? (
        <div style={{
          padding: '12px 14px',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          fontSize: '0.85rem',
          marginBottom: '14px'
        }}>
          ⚠️ {modelStatus.error_message}
        </div>
      ) : null}

      {/* Model Spec Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Model Name</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
            {modelStatus?.model_name || 'Random Forest Classifier'}
          </div>
        </div>

        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Algorithm</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8', marginTop: '2px' }}>
            {modelStatus?.algorithm || 'RandomForestClassifier(n_estimators=120)'}
          </div>
        </div>

        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Dataset Samples</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
            {modelStatus?.dataset_samples ? `${modelStatus.dataset_samples.toLocaleString()} Samples (Local)` : '1,800 Samples'}
          </div>
        </div>

        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Model Accuracy</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
            {modelStatus?.accuracy_pct ? `${modelStatus.accuracy_pct}%` : '83.61%'}
          </div>
        </div>

        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Last Trained</div>
          <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            {modelStatus?.last_trained || 'Local Session'}
          </div>
        </div>

        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Features Monitored</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
            {modelStatus?.features ? `${modelStatus.features.length} Features` : '11 Features'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={handleTrain}
          disabled={loading}
          className="btn-primary"
          style={{ fontSize: '0.8rem', padding: '8px 14px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Train Model</span>
        </button>

        <button
          onClick={handleRunPrediction}
          disabled={loading}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '8px 14px' }}
        >
          <Play size={14} />
          <span>Run Prediction</span>
        </button>

        <button
          onClick={handleReload}
          disabled={loading}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '8px 14px' }}
        >
          <RotateCcw size={14} />
          <span>Reload Model</span>
        </button>
      </div>

      {msg && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          borderRadius: '6px',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          color: '#38bdf8',
          fontSize: '0.78rem'
        }}>
          ℹ {msg}
        </div>
      )}
    </div>
  );
}
