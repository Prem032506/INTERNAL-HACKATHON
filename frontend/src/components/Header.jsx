import React from 'react';
import {
  CloudRain,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function Header({
  user,
  simulationActive,
  onTriggerSimulation,
  onResetSimulation,
  isSimulating,
  onOpenLogin,
  onLogout
}) {
  return (
    <header className="top-header">
      {/* Left: System Status & Title */}
      <div className="header-left">
        <div className="header-title-box">
          <h1>
            <span>GLOBAL-SETU COMMAND CENTER</span>
            <div className={`status-pill ${simulationActive ? 'simulating' : ''}`}>
              <span className="dot"></span>
              <span>{simulationActive ? 'SIMULATION MODE' : (user ? 'LOCAL AI ONLINE' : 'PUBLIC DASHBOARD')}</span>
            </div>
          </h1>
        </div>

        <span className="badge-source">DATA SOURCE: LOCAL DATASET</span>
      </div>

      {/* Right: Actions & User Info */}
      <div className="header-actions">
        {/* Simulate Heavy Rainfall Button */}
        <button
          onClick={onTriggerSimulation}
          disabled={isSimulating}
          className={`btn-simulate ${simulationActive ? 'active' : ''}`}
          title="Simulate intense cloudburst & re-run Random Forest model on all NER routes"
        >
          {isSimulating ? (
            <>
              <Zap size={15} className="animate-spin" />
              <span>RUNNING ML INFERENCE...</span>
            </>
          ) : (
            <>
              <CloudRain size={16} />
              <span>SIMULATE HEAVY RAINFALL</span>
            </>
          )}
        </button>

        {/* Reset Simulation Button */}
        {simulationActive && (
          <button
            onClick={onResetSimulation}
            className="btn-reset"
            title="Restore baseline local dataset and AI road evaluations"
          >
            <RotateCcw size={14} />
            <span>Restore Baseline</span>
          </button>
        )}

        {/* User Profile or Officer Login Action */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="user-profile-badge">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name || user.username}</span>
                <span className="user-role">{user.role || 'Officer'}</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="btn-reset"
              title="Logout session and return to guest dashboard"
              style={{ padding: '6px 8px' }}
            >
              <LogOut size={14} color="#f87171" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
          >
            <KeyRound size={15} />
            <span>Officer Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
