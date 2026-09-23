import React, { useState, useEffect } from 'react';
import {
  FileText,
  Send,
  Camera,
  MapPin,
  AlertTriangle,
  CheckCircle,
  User,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';

export default function FieldReportsPage({ onReportSubmitted }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form inputs
  const [location, setLocation] = useState('');
  const [issueType, setIssueType] = useState('Landslide');
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('Field Officer (NHIDCL Patrol #3)');
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load field reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) {
      alert('Please fill out location and incident description.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitReport({
        location,
        issue_type: issueType,
        severity,
        description,
        photo_url: photoPreview,
        reported_by: reportedBy
      });

      setSuccessMsg('Field incident logged successfully! Integrated into SQLite DB & Map Alert System.');
      setLocation('');
      setDescription('');
      setPhotoPreview(null);
      fetchReports();
      if (onReportSubmitted) onReportSubmitted();

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      alert('Error submitting report: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <FileText size={20} color="#38bdf8" />
            <span>FIELD OFFICER DISASTER & INCIDENT REPORTING</span>
          </div>
          <span className="badge-source">OFFLINE FIRST LOCAL REPORT INGESTION</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
          Ground inspection reports immediately update the local risk network and recalculate route accessibility penalties in real-time.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
        {/* Form Column */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>
            SUBMIT ON-SITE GROUND INCIDENT REPORT
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">INCIDENT LOCATION / HIGHWAY MILEPOST</label>
              <input
                type="text"
                placeholder="e.g., NH-06 Km 114 Sonapur Ridge or Kohima Bypass"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-control"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">ISSUE TYPE</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="form-control"
                >
                  <option value="Road Blockage">Road Blockage</option>
                  <option value="Flood">Flood</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Accident">Accident</option>
                  <option value="Bridge Damage">Bridge Damage</option>
                  <option value="Infrastructure Problem">Infrastructure Problem</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">OBSERVED SEVERITY</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="form-control"
                >
                  <option value="CRITICAL">CRITICAL (Impassable)</option>
                  <option value="HIGH">HIGH (Severe Hazard)</option>
                  <option value="MODERATE">MODERATE (Single Lane)</option>
                  <option value="LOW">LOW (Cautionary Minor)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">DETAILED DAMAGE & GROUND DESCRIPTION</label>
              <textarea
                placeholder="Describe road surface condition, water depth, debris volume, or equipment requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">REPORTING OFFICER / UNIT</label>
              <input
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="form-control"
                required
              />
            </div>

            {/* Photo Attachment */}
            <div className="form-group">
              <label className="form-label">EVIDENCE ATTACHMENT (PHOTO)</label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                border: '1px dashed var(--border-color)',
                borderRadius: '8px'
              }}>
                <label style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  fontSize: '0.75rem'
                }}>
                  <Camera size={14} />
                  <span>Choose Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {photoPreview ? 'Photo attached ✓' : 'Local upload supported'}
                </span>
              </div>

              {photoPreview && (
                <div style={{ marginTop: '8px', maxWidth: '120px', borderRadius: '6px', overflow: 'hidden' }}>
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ justifyContent: 'center', marginTop: '6px' }}
            >
              <Send size={15} />
              <span>{submitting ? 'TRANSMITTING REPORT...' : 'SUBMIT FIELD REPORT'}</span>
            </button>

            {successMsg && (
              <div style={{
                padding: '10px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                fontSize: '0.8rem'
              }}>
                ✓ {successMsg}
              </div>
            )}
          </form>
        </div>

        {/* Reports History Feed */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              VERIFIED FIELD REPORTS ({reports.length})
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Stored in SQLite</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reports.map((rep) => (
              <div
                key={rep.id}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${
                    rep.severity === 'CRITICAL' ? 'badge-red' :
                    rep.severity === 'HIGH' ? 'badge-orange' : 'badge-yellow'
                  }`}>
                    {rep.issue_type}: {rep.severity}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    {rep.timestamp}
                  </span>
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>
                  {rep.location}
                </div>

                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {rep.description}
                </p>

                {rep.photo_url && (
                  <div style={{ maxWidth: '140px', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                    <img src={rep.photo_url} alt="Field Photo" style={{ width: '100%', height: 'auto' }} />
                  </div>
                )}

                <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '4px' }}>
                  Logged by: {rep.reported_by}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
