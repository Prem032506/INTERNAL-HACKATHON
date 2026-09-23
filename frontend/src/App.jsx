import React, { useState, useEffect } from 'react';
import { api } from './services/api';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

import OverviewPage from './pages/OverviewPage';
import LiveMapPage from './pages/LiveMapPage';
import RouteIntelligencePage from './pages/RouteIntelligencePage';
import DisasterRiskPage from './pages/DisasterRiskPage';
import WeatherPage from './pages/WeatherPage';
import LogisticsPage from './pages/LogisticsPage';
import AlertsPage from './pages/AlertsPage';
import FieldReportsPage from './pages/FieldReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  // First interface starts in Public Dashboard mode (user = null)
  const [user, setUser] = useState(null);

  const [activePage, setActivePage] = useState('overview');
  const [mapData, setMapData] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [notification, setNotification] = useState(null);

  // Routing initial parameters passed from map click
  const [routingParams, setRoutingParams] = useState({ origin: 'Guwahati', destination: 'Imphal' });

  useEffect(() => {
    loadMapData();
    checkSimulationStatus();
  }, []);

  const loadMapData = async () => {
    try {
      const data = await api.getMapData();
      setMapData(data);
    } catch (err) {
      console.error('Failed to load map data:', err);
    }
  };

  const checkSimulationStatus = async () => {
    try {
      const res = await api.getSimulationStatus();
      setSimulationActive(res.is_simulating);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await api.simulateHeavyRainfall();
      setSimulationActive(true);
      await loadMapData();
      setNotification({
        type: 'warning',
        title: 'EXTREME HEAVY RAINFALL SIMULATED ACROSS NER',
        message: `${res.affected_roads_count} road sectors degraded. ${res.generated_alerts_count} emergency alerts logged in SQLite database.`
      });
      setTimeout(() => setNotification(null), 8000);
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetSimulation = async () => {
    try {
      await api.resetSimulation();
      setSimulationActive(false);
      await loadMapData();
      setNotification({
        type: 'info',
        title: 'BASELINE RESTORED',
        message: 'Simulation cleared. Restored baseline local dataset and AI road risk evaluations.'
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      alert('Reset error: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    setUser(null);
    setActivePage('overview');
    setNotification({
      type: 'info',
      title: 'SESSION TERMINATED',
      message: 'Logged out. Returned to Public Command Dashboard.'
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLoginSuccess = (authenticatedUser) => {
    if (authenticatedUser) {
      setUser(authenticatedUser);
      setActivePage('overview'); // Transition to final authenticated dashboard!
      setNotification({
        type: 'info',
        title: `AUTHENTICATED: ${authenticatedUser.name.toUpperCase()}`,
        message: `Role: ${authenticatedUser.role}. Full operational controls and emergency dispatch privileges unlocked.`
      });
      setTimeout(() => setNotification(null), 6000);
    } else {
      // Returned as guest
      setActivePage('overview');
    }
  };

  const handleNavigateToRouting = (src, dst) => {
    setRoutingParams({ origin: src, destination: dst });
    setActivePage('route-intelligence');
  };

  // If user navigated to the login page (Step 2 of the flow)
  if (activePage === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setActivePage('login')}
        simulationActive={simulationActive}
      />

      {/* Main Command Center Workspace (Step 1: First Interface / Step 3: Final Authenticated Dashboard) */}
      <div className="main-area">
        <Header
          user={user}
          simulationActive={simulationActive}
          onTriggerSimulation={handleTriggerSimulation}
          onResetSimulation={handleResetSimulation}
          isSimulating={isSimulating}
          onOpenLogin={() => setActivePage('login')}
          onLogout={handleLogout}
        />

        {/* Global Notification Banner */}
        {notification && (
          <div style={{
            margin: '12px 24px 0 24px',
            padding: '12px 18px',
            borderRadius: '8px',
            background: notification.type === 'warning' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.15)',
            border: `1px solid ${notification.type === 'warning' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div>
              <strong style={{ color: notification.type === 'warning' ? '#f87171' : '#38bdf8', fontSize: '0.85rem' }}>
                {notification.title}:
              </strong>{' '}
              <span style={{ fontSize: '0.82rem', color: '#f8fafc' }}>
                {notification.message}
              </span>
            </div>
            <button
              onClick={() => setNotification(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Dynamic Pages */}
        {activePage === 'overview' && (
          <OverviewPage
            mapData={mapData}
            onNavigateToRouting={handleNavigateToRouting}
            onModelUpdated={loadMapData}
          />
        )}

        {activePage === 'live-map' && (
          <LiveMapPage
            mapData={mapData}
            onNavigateToRouting={handleNavigateToRouting}
          />
        )}

        {activePage === 'route-intelligence' && (
          <RouteIntelligencePage
            locations={mapData?.locations || []}
            roads={mapData?.roads || []}
            initialOrigin={routingParams.origin}
            initialDestination={routingParams.destination}
          />
        )}

        {activePage === 'disaster-risk' && (
          <DisasterRiskPage
            disasters={mapData?.disasters || []}
            alerts={[]}
            onRefresh={loadMapData}
          />
        )}

        {activePage === 'weather' && (
          <WeatherPage />
        )}

        {activePage === 'logistics' && (
          <LogisticsPage
            locations={mapData?.locations || []}
          />
        )}

        {activePage === 'alerts' && (
          <AlertsPage />
        )}

        {activePage === 'field-reports' && (
          <FieldReportsPage
            onReportSubmitted={loadMapData}
          />
        )}

        {activePage === 'analytics' && (
          <AnalyticsPage />
        )}

        {activePage === 'settings' && (
          <SettingsPage
            user={user}
            onModelUpdated={loadMapData}
          />
        )}
      </div>
    </div>
  );
}
