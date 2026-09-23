import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Mail,
  UserCheck,
  ArrowRight,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  // Register state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Administrator');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.login(username, password);
      onLoginSuccess(res.user);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.register({
        name,
        email,
        username,
        password,
        confirm_password: confirmPassword,
        role
      });
      onLoginSuccess(res.user);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    setIsRegister(false);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.12) 0%, transparent 60%), #090d16',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '460px',
        maxWidth: '100%',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            margin: '0 auto 12px auto',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 0 24px rgba(6, 182, 212, 0.4)'
          }}>
            <ShieldCheck size={30} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
            GLOBAL-SETU
          </h1>
          <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            AI Disaster & Logistics Intelligence (NER India)
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              background: !isRegister ? 'var(--accent-blue)' : 'transparent',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              background: isRegister ? 'var(--accent-blue)' : 'transparent',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div style={{
            padding: '10px 12px',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.8rem',
            marginBottom: '16px'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        {!isRegister ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">USERNAME OR EMAIL</label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="#94a3b8" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ justifyContent: 'center', padding: '12px', marginTop: '6px' }}
            >
              <KeyRound size={16} />
              <span>{loading ? 'AUTHENTICATING...' : 'ACCESS COMMAND CENTER'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">FULL NAME</label>
              <input
                type="text"
                placeholder="e.g., Major Alok Baruah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">EMAIL</label>
                <input
                  type="email"
                  placeholder="officer@ner.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">USERNAME</label>
                <input
                  type="text"
                  placeholder="abaruah"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ROLE ASSIGNMENT</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-control"
              >
                <option value="Administrator">Administrator</option>
                <option value="Logistics Operator">Logistics Operator</option>
                <option value="Disaster Management Officer">Disaster Management Officer</option>
                <option value="Field Officer">Field Officer</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ justifyContent: 'center', padding: '12px', marginTop: '6px' }}
            >
              <UserCheck size={16} />
              <span>{loading ? 'REGISTERING...' : 'REGISTER & LOGIN'}</span>
            </button>
          </form>
        )}

        {/* Demo Fast Login Helpers for Judges */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={() => onLoginSuccess(null)}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              ← Return to Public Dashboard & Map
            </button>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '8px', textAlign: 'center' }}>
            DEMO PRE-SEEDED CREDENTIALS (CLICK TO FILL)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin', 'admin123')}
              className="btn-secondary"
              style={{ fontSize: '0.7rem', padding: '6px 8px', justifyContent: 'center' }}
            >
              Admin (admin123)
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('operator', 'logistics123')}
              className="btn-secondary"
              style={{ fontSize: '0.7rem', padding: '6px 8px', justifyContent: 'center' }}
            >
              Logistics (operator123)
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('officer', 'disaster123')}
              className="btn-secondary"
              style={{ fontSize: '0.7rem', padding: '6px 8px', justifyContent: 'center' }}
            >
              Disaster Officer
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('field', 'field123')}
              className="btn-secondary"
              style={{ fontSize: '0.7rem', padding: '6px 8px', justifyContent: 'center' }}
            >
              Field Patrol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
