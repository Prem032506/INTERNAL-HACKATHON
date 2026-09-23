import React from 'react';
import {
  LayoutDashboard,
  Map,
  Navigation,
  AlertTriangle,
  CloudRain,
  Truck,
  Bell,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  Radio,
  KeyRound,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, user, onLogout, onOpenLogin, simulationActive }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live-map', label: 'Live Map', icon: Map, badge: simulationActive ? 'ALERT' : null },
    { id: 'route-intelligence', label: 'Route Intelligence', icon: Navigation },
    { id: 'disaster-risk', label: 'Disaster & Risk', icon: AlertTriangle },
    { id: 'weather', label: 'Weather', icon: CloudRain },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'field-reports', label: 'Field Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Header / Brand */}
      <div className="sidebar-header" onClick={() => setActivePage('overview')} style={{ cursor: 'pointer' }}>
        <div className="logo-badge">
          <ShieldCheck size={22} />
        </div>
        <div>
          <div className="sidebar-title">GLOBAL-SETU</div>
          <div className="sidebar-subtitle">NER Logistics & Disaster AI</div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className="badge badge-red" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}

        {/* If guest, display a Sign In navigation item */}
        {!user && (
          <div
            className={`nav-item ${activePage === 'login' ? 'active' : ''}`}
            onClick={onOpenLogin}
            style={{
              marginTop: '8px',
              background: 'rgba(6, 182, 212, 0.1)',
              borderColor: 'rgba(6, 182, 212, 0.3)',
              color: '#38bdf8'
            }}
          >
            <KeyRound size={18} color="#38bdf8" />
            <span style={{ flex: 1, fontWeight: 700 }}>Officer Sign In</span>
          </div>
        )}
      </nav>

      {/* Bottom Status & Logout */}
      <div className="sidebar-footer">
        <div style={{
          padding: '8px 10px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.72rem'
        }}>
          <Radio size={14} color="#10b981" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>ENGINE ARCHITECTURE</span>
            <span style={{ color: '#f8fafc', fontWeight: 600 }}>100% Offline-Local</span>
          </div>
        </div>

        {user ? (
          <button
            onClick={onLogout}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <LogOut size={15} />
            <span>Logout ({user.username})</span>
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <UserCheck size={15} />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </aside>
  );
}
