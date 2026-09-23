/**
 * API Client for GLOBAL-SETU Platform
 * Connects React frontend directly to local Flask REST services
 */

const API_BASE_URL = '/api';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (username, password) => fetchJson('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (userData) => fetchJson('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => fetchJson('/auth/me'),
  logout: () => fetchJson('/auth/logout', { method: 'POST' }),

  // Map & Live Data
  getMapData: () => fetchJson('/map/data'),
  getRoads: () => fetchJson('/roads'),
  getLocations: () => fetchJson('/locations'),

  // ML Intelligence
  getMLStatus: () => fetchJson('/ml/status'),
  trainMLModel: () => fetchJson('/ml/train', { method: 'POST' }),
  reloadMLModel: () => fetchJson('/ml/reload', { method: 'POST' }),
  predictRisk: (featureData) => fetchJson('/ml/predict', { method: 'POST', body: JSON.stringify(featureData) }),

  // Route Intelligence (Dijkstra / A*)
  optimizeRoute: (routeParams) => fetchJson('/route/optimize', { method: 'POST', body: JSON.stringify(routeParams) }),

  // Heavy Rainfall Simulation
  simulateHeavyRainfall: () => fetchJson('/simulate/heavy-rainfall', { method: 'POST' }),
  resetSimulation: () => fetchJson('/simulate/reset', { method: 'POST' }),
  getSimulationStatus: () => fetchJson('/simulate/status'),

  // Logistics
  getShipments: () => fetchJson('/logistics/shipments'),
  createShipment: (data) => fetchJson('/logistics/shipments', { method: 'POST', body: JSON.stringify(data) }),
  updateShipmentStatus: (id, data) => fetchJson(`/logistics/shipments/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Alerts
  getAlerts: () => fetchJson('/alerts'),
  createAlert: (data) => fetchJson('/alerts', { method: 'POST', body: JSON.stringify(data) }),
  resolveAlert: (id) => fetchJson(`/alerts/${id}/resolve`, { method: 'POST' }),

  // Field Reports
  getReports: () => fetchJson('/reports'),
  submitReport: (data) => fetchJson('/reports', { method: 'POST', body: JSON.stringify(data) }),

  // Weather & Analytics
  getWeather: () => fetchJson('/weather'),
  getAnalytics: () => fetchJson('/analytics/summary'),
  getDiagnostics: () => fetchJson('/diagnostics')
};
