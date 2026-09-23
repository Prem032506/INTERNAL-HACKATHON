import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Layers,
  CloudRain
} from 'lucide-react';
import { api } from '../services/api';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const accessibilityColors = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];
  const riskColors = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <BarChart3 size={20} color="#38bdf8" />
            <span>NER ACCESSIBILITY & PREDICTIVE ANALYTICS</span>
          </div>
          <span className="badge-source">DATA SOURCE: LOCAL MODEL EVALUATION</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
          Historical disaster incident distribution, multi-factor road risk exposure, and 7-day Random Forest inference confidence tracking.
        </p>
      </div>

      {/* Grid 1: Accessibility Distribution & Risk Levels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Chart 1: Road Accessibility Breakdown */}
        <div className="glass-panel">
          <div className="panel-header">
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>ROAD ACCESSIBILITY STATUS</h4>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Count by Classification</span>
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.accessibility_chart || []}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]}>
                  {(data?.accessibility_chart || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: AI Risk Level Distribution */}
        <div className="glass-panel">
          <div className="panel-header">
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>AI PREDICTED RISK LEVEL SHARE</h4>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>4-Class Distribution</span>
          </div>
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.risk_chart || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="level"
                >
                  {(data?.risk_chart || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={riskColors[index % riskColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 2: Weather Impact & 7-Day Prediction History */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Chart 3: Historical Disasters by Type */}
        <div className="glass-panel">
          <div className="panel-header">
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>DISASTER OCCURRENCES BY TYPE</h4>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Active Incidents</span>
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.disaster_chart || []} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="type" type="category" stroke="#94a3b8" fontSize={11} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: AI Model 7-Day Performance & Confidence */}
        <div className="glass-panel">
          <div className="panel-header">
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>AI PREDICTION CONFIDENCE & ACCURACY</h4>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Rolling Weekly Trend</span>
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.ai_history || []}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[80, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend />
                <Line type="monotone" dataKey="confidence" name="Confidence %" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="accuracy" name="Validation Accuracy %" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
