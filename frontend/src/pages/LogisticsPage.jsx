import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Send,
  Package,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function LogisticsPage({ locations = [] }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // New Shipment Form State
  const [vehicleNumber, setVehicleNumber] = useState('AS-01-XX-9821');
  const [cargoType, setCargoType] = useState('Medical Supplies');
  const [priority, setPriority] = useState('EMERGENCY');
  const [origin, setOrigin] = useState('Guwahati');
  const [destination, setDestination] = useState('Silchar');
  const [etaHours, setEtaHours] = useState('8.5');
  const [notes, setNotes] = useState('Critical trauma equipment and plasma kits for district hospital.');

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const data = await api.getShipments();
      setShipments(data);
    } catch (err) {
      console.error('Failed to load shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      await api.createShipment({
        vehicle_number: vehicleNumber,
        cargo_type: cargoType,
        priority,
        origin,
        origin_id: 'LOC_AUTO',
        destination,
        destination_id: 'LOC_AUTO',
        eta_hours: parseFloat(etaHours),
        risk_status: priority === 'EMERGENCY' ? 'HIGH' : 'LOW',
        shipment_status: 'In Transit',
        carrier_unit: 'NER Civil Relief Fleet',
        notes
      });
      setShowModal(false);
      fetchShipments();
    } catch (err) {
      alert('Error creating shipment: ' + err.message);
    }
  };

  const handleStatusChange = async (shipmentId, newStatus) => {
    try {
      await api.updateShipmentStatus(shipmentId, { shipment_status: newStatus });
      fetchShipments();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  return (
    <div className="page-container">
      {/* Header Bar */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Truck size={20} color="#38bdf8" />
            <span>NER LOGISTICS & CONVOY DISPATCH MANAGEMENT</span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
          >
            <Plus size={15} />
            <span>Dispatch New Convoy</span>
          </button>
        </div>

        {/* Quick KPI stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '10px' }}>
          <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>IN TRANSIT</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
              {shipments.filter(s => s.shipment_status === 'In Transit').length}
            </div>
          </div>
          <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>REROUTED / DETOUR</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
              {shipments.filter(s => s.shipment_status === 'Rerouted').length}
            </div>
          </div>
          <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>WEATHER DELAYED</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>
              {shipments.filter(s => s.shipment_status === 'Delayed').length}
            </div>
          </div>
          <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>DELIVERED</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              {shipments.filter(s => s.shipment_status === 'Delivered').length}
            </div>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>ACTIVE SHIPMENTS ROSTER</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>SHIPMENT ID</th>
                <th>VEHICLE</th>
                <th>CARGO TYPE</th>
                <th>PRIORITY</th>
                <th>ROUTE (FROM ➔ TO)</th>
                <th>ETA</th>
                <th>RISK STATUS</th>
                <th>TRANSIT STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                    {s.id}
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.vehicle_number}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Package size={13} color="#94a3b8" />
                      {s.cargo_type}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      s.priority === 'EMERGENCY' || s.priority === 'CRITICAL' ? 'badge-red' :
                      s.priority === 'HIGH' ? 'badge-orange' : 'badge-green'
                    }`}>
                      {s.priority}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {s.origin} ➔ {s.destination}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{s.eta_hours} hrs</td>
                  <td>
                    <span className={`badge ${
                      s.risk_status === 'CRITICAL' ? 'badge-red' :
                      s.risk_status === 'HIGH' ? 'badge-orange' :
                      s.risk_status === 'MODERATE' ? 'badge-yellow' : 'badge-green'
                    }`}>
                      {s.risk_status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={s.shipment_status}
                      onChange={(e) => handleStatusChange(s.id, e.target.value)}
                      style={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        color: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem'
                      }}
                    >
                      <option value="In Transit">In Transit</option>
                      <option value="Delayed">Delayed</option>
                      <option value="Rerouted">Rerouted</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {s.carrier_unit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Convoy Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div className="glass-panel" style={{ width: '480px', maxWidth: '95vw', background: 'var(--bg-secondary)' }}>
            <div className="panel-header">
              <div className="panel-title">
                <Truck size={18} color="#38bdf8" />
                <span>DISPATCH RELIEF LOGISTICS CONVOY</span>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">VEHICLE IDENTIFIER</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">CARGO TYPE</label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                    className="form-control"
                  >
                    <option value="Medical Supplies">Medical Supplies</option>
                    <option value="Food & Rations">Food & Rations</option>
                    <option value="Water Purification Units">Water Purification</option>
                    <option value="Emergency Equipment">Emergency Equipment</option>
                    <option value="Construction Materials">Construction Materials</option>
                    <option value="Agricultural Products">Agricultural Products</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">PRIORITY</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="form-control"
                  >
                    <option value="EMERGENCY">EMERGENCY</option>
                    <option value="HIGH">HIGH</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">ORIGIN</label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="form-control"
                  >
                    {locations.map((l) => (
                      <option key={l.location_id} value={l.name}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">DESTINATION</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="form-control"
                  >
                    {locations.map((l) => (
                      <option key={l.location_id} value={l.name}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ESTIMATED TRANSIT TIME (HOURS)</label>
                <input
                  type="number"
                  step="0.5"
                  value={etaHours}
                  onChange={(e) => setEtaHours(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">DISPATCH NOTES / MANIFEST</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-control"
                  rows="2"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Send size={15} />
                  <span>Authorize & Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
