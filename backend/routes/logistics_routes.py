"""
Logistics API routes for GLOBAL-SETU Platform
"""
import os
import random
from flask import Blueprint, request, jsonify
from database.db import get_db

logistics_bp = Blueprint('logistics', __name__, url_prefix='/api/logistics')

@logistics_bp.route('/shipments', methods=['GET'])
def get_shipments():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM shipments ORDER BY updated_at DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(rows), 200

@logistics_bp.route('/shipments', methods=['POST'])
def create_shipment():
    data = request.get_json() or {}
    shipment_id = data.get('id') or f"SHP-{random.randint(9000, 9999)}"
    vehicle = data.get('vehicle_number', 'AS-01-XX-0000')
    cargo = data.get('cargo_type', 'Medical Supplies')
    priority = data.get('priority', 'HIGH')
    origin = data.get('origin', 'Guwahati')
    origin_id = data.get('origin_id', 'LOC_GHY')
    dest = data.get('destination', 'Silchar')
    dest_id = data.get('destination_id', 'LOC_SIL')
    eta = float(data.get('eta_hours', 8.0))
    risk = data.get('risk_status', 'MODERATE')
    status = data.get('shipment_status', 'In Transit')
    carrier = data.get('carrier_unit', 'NER Emergency Convoy')
    notes = data.get('notes', 'Dispatched under active AI route monitoring')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO shipments 
        (id, vehicle_number, cargo_type, priority, origin, origin_id, destination, destination_id, eta_hours, risk_status, shipment_status, carrier_unit, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (shipment_id, vehicle, cargo, priority, origin, origin_id, dest, dest_id, eta, risk, status, carrier, notes))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Shipment created successfully', 'shipment_id': shipment_id}), 201

@logistics_bp.route('/shipments/<shipment_id>/status', methods=['PATCH'])
def update_shipment_status(shipment_id):
    data = request.get_json() or {}
    new_status = data.get('shipment_status')
    new_risk = data.get('risk_status')
    notes = data.get('notes')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM shipments WHERE id = ?", (shipment_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Shipment not found'}), 404

    updates = []
    params = []
    if new_status:
        updates.append("shipment_status = ?")
        params.append(new_status)
    if new_risk:
        updates.append("risk_status = ?")
        params.append(new_risk)
    if notes:
        updates.append("notes = ?")
        params.append(notes)

    if updates:
        params.append(shipment_id)
        cursor.execute(f"UPDATE shipments SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", params)
        conn.commit()

    conn.close()
    return jsonify({'message': 'Shipment updated successfully'}), 200
