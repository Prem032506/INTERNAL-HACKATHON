/**
 * API Client for GLOBAL-SETU Platform
 * Connects React frontend to Flask REST services with seamless offline fallback for GitHub Pages
 */
import fallbackData from './fallbackData.json';

const API_BASE_URL = '/api';

// Local simulation state for offline / GitHub Pages mode
let localSimulationActive = false;
let localRoads = [...fallbackData.roads];

function getSimulatedRoads() {
  if (!localSimulationActive) return fallbackData.roads;
  return fallbackData.roads.map((r) => {
    if (['RD_05', 'RD_06', 'RD_07', 'RD_10', 'RD_14', 'RD_19'].includes(r.road_id)) {
      return {
        ...r,
        rainfall_mm: Math.max(r.rainfall_mm, 210),
        risk_score: 95,
        risk_level: 'CRITICAL',
        road_status: 'BLOCKED',
        is_simulated: true
      };
    }
    return {
      ...r,
      rainfall_mm: r.rainfall_mm + 40,
      risk_score: Math.min(92, r.risk_score + 25),
      risk_level: r.risk_score + 25 > 70 ? 'HIGH' : 'MODERATE',
      road_status: r.risk_score + 25 > 70 ? 'HIGH_RISK' : 'RESTRICTED',
      is_simulated: true
    };
  });
}

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
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    // Graceful offline fallback (e.g. on GitHub Pages static deployment)
    return handleOfflineFallback(endpoint, options);
  }
}

function handleOfflineFallback(endpoint, options = {}) {
  if (endpoint === '/map/data') {
    const roads = getSimulatedRoads();
    return {
      roads: roads,
      locations: fallbackData.locations,
      disasters: fallbackData.disasters,
      kpis: {
        roads_monitored: roads.length,
        accessible_roads: roads.filter(r => r.road_status === 'ACCESSIBLE').length,
        restricted_roads: roads.filter(r => r.road_status === 'RESTRICTED').length,
        critical_roads: roads.filter(r => ['CRITICAL', 'HIGH_RISK', 'BLOCKED'].includes(r.road_status) || r.risk_level === 'CRITICAL').length,
        active_alerts: localSimulationActive ? 9 : 5,
        high_risk_zones: localSimulationActive ? 12 : 6,
        active_logistics: 8,
        ai_predictions: 96
      },
      field_reports: [
        {
          id: 1,
          road_id: 'RD_07',
          report_type: 'Landslide',
          severity: 'CRITICAL',
          description: 'Major rockfall across NH-06 between Jowai and Ratacherra. Both lanes blocked.',
          reported_by: 'Inspector L. Lyngdoh (Meghalaya Police)',
          location_name: 'East Jaintia Hills, Meghalaya',
          timestamp: 'Just now'
        }
      ]
    };
  }

  if (endpoint === '/roads') return getSimulatedRoads();
  if (endpoint === '/locations') return fallbackData.locations;

  if (endpoint === '/ml/status') {
    return {
      model_name: 'NER Road Accessibility Random Forest Classifier',
      algorithm: 'RandomForestClassifier(n_estimators=120, max_depth=12)',
      dataset_source: 'Local NER Roads & Disaster History Dataset',
      dataset_samples: 1800,
      accuracy_pct: 83.61,
      classes: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      features: ['rainfall_mm', 'temp_c', 'humidity_pct', 'road_condition_num', 'terrain_num', 'elevation_m', 'historical_incidents', 'flood_history', 'landslide_history', 'traffic_density_num', 'infrastructure_rating'],
      status: 'TRAINED & READY'
    };
  }

  if (endpoint === '/simulate/status') {
    return { is_simulating: localSimulationActive };
  }

  if (endpoint === '/simulate/heavy-rainfall') {
    localSimulationActive = true;
    return {
      success: true,
      is_simulating: true,
      affected_roads_count: 14,
      generated_alerts_count: 6
    };
  }

  if (endpoint === '/simulate/reset') {
    localSimulationActive = false;
    return { success: true, is_simulating: false };
  }

  if (endpoint === '/weather') {
    return fallbackData.weather;
  }

  if (endpoint === '/logistics/shipments') {
    return fallbackData.logistics;
  }

  if (endpoint === '/alerts') {
    return fallbackData.disasters.map(d => ({
      alert_id: `ALT_${d.disaster_id}`,
      severity: d.severity,
      title: `${d.type.toUpperCase()} WARNING: ${d.location}`,
      description: d.description,
      status: 'ACTIVE',
      created_at: d.reported_at
    }));
  }

  if (endpoint === '/route/optimize') {
    const body = options.body ? JSON.parse(options.body) : {};
    return {
      success: true,
      algorithm: body.algorithm || 'DIJKSTRA_AI_SAFETY',
      origin: body.origin || 'Guwahati',
      destination: body.destination || 'Imphal',
      distance_km: 485,
      estimated_travel_time_hours: 11.2,
      safety_score: 88,
      risk_level: 'MODERATE',
      path: ['Guwahati', 'Tezpur', 'Jorhat', 'Dimapur', 'Kohima', 'Imphal'],
      road_segments: ['RD_01', 'RD_04', 'RD_12', 'RD_05', 'RD_06'],
      contingency_notes: 'Standard primary corridor via NH-27 & NH-29 with real-time hazard avoidance active.'
    };
  }

  if (endpoint === '/auth/me') {
    return { user: null };
  }

  if (endpoint === '/auth/login') {
    const body = options.body ? JSON.parse(options.body) : {};
    return {
      success: true,
      user: {
        id: 1,
        username: body.username || 'admin',
        name: body.username === 'admin' ? 'Commander Sharma' : body.username,
        role: 'COMMANDER'
      }
    };
  }

  return { status: 'OK' };
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
