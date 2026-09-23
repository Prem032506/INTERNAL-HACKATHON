"""
Alerts and Field Incident Reports routes for GLOBAL-SETU Platform
"""
from flask import Blueprint, request, jsonify
from database.db import get_db

alerts_bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')
reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@alerts_bp.route('', methods=['GET'])
def get_alerts():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY id DESC")
    alerts = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(alerts), 200

@alerts_bp.route('', methods=['POST'])
def create_alert():
    data = request.get_json() or {}
    title = data.get('title')
    severity = data.get('severity', 'HIGH')
    category = data.get('category', 'Road Blockage')
    location = data.get('location', 'NER Network')
    road = data.get('affected_road', '')
    desc = data.get('description', '')

    if not title or not desc:
        return jsonify({'error': 'Title and description required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO alerts (title, severity, category, location, affected_road, description)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (title, severity, category, location, road, desc))
    conn.commit()
    alert_id = cursor.lastrowid
    conn.close()

    return jsonify({'message': 'Alert broadcast created', 'id': alert_id}), 201

@alerts_bp.route('/<int:alert_id>/resolve', methods=['POST'])
def resolve_alert(alert_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET status = 'RESOLVED' WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Alert marked as resolved'}), 200

# FIELD REPORTS
@reports_bp.route('', methods=['GET'])
def get_reports():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM field_reports ORDER BY id DESC")
    reports = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(reports), 200

@reports_bp.route('', methods=['POST'])
def submit_report():
    data = request.get_json() or {}
    location = data.get('location', '').strip()
    issue_type = data.get('issue_type', 'Road Blockage')
    severity = data.get('severity', 'HIGH')
    description = data.get('description', '').strip()
    photo_url = data.get('photo_url')
    reported_by = data.get('reported_by', 'Field Officer (On-Site)')

    if not location or not description:
        return jsonify({'error': 'Location and description are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO field_reports (location, issue_type, severity, description, photo_url, reported_by)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (location, issue_type, severity, description, photo_url, reported_by))

    # Also automatically create an incident alert if severity is HIGH or CRITICAL
    if severity in ['HIGH', 'CRITICAL']:
        alert_title = f"FIELD REPORT: {issue_type} at {location}"
        cursor.execute("""
            INSERT INTO alerts (title, severity, category, location, description)
            VALUES (?, ?, ?, ?, ?)
        """, (alert_title, severity, issue_type, location, f"Field report submitted: {description} (Reported by: {reported_by})"))

    conn.commit()
    report_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'message': 'Field incident report logged successfully and integrated into active intelligence network.',
        'report_id': report_id
    }), 201
