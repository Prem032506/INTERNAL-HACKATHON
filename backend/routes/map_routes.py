"""
Map and Geospatial data API routes for GLOBAL-SETU Platform
"""
import os
import pandas as pd
from flask import Blueprint, jsonify
from database.db import get_db
from ml.predict import predict_risk

map_bp = Blueprint('map', __name__, url_prefix='/api')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, 'data')

def get_live_roads_data():
    roads_csv = os.path.join(DATA_DIR, 'roads.csv')
    if not os.path.exists(roads_csv):
        return []

    roads_df = pd.read_csv(roads_csv)

    # Check for active simulation overrides in SQLite
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM road_simulations WHERE is_simulated = 1")
    sim_rows = {row['road_id']: dict(row) for row in cursor.fetchall()}
    conn.close()

    roads_list = []
    for _, r in roads_df.iterrows():
        road = r.to_dict()
        road_id = road['road_id']

        if road_id in sim_rows:
            sim = sim_rows[road_id]
            road['rainfall_mm'] = sim['current_rainfall']
            road['risk_score'] = sim['risk_score']
            road['risk_level'] = sim['risk_level']
            road['road_status'] = sim['road_status']
            road['is_simulated'] = True
        else:
            road['is_simulated'] = False
            # Dynamic AI calculation for baseline if not explicitly scored
            ai_eval = predict_risk(road)
            road['risk_score'] = ai_eval['risk_score']
            # Re-align risk_level with prediction if not overridden
            if road['road_status'] != 'BLOCKED':
                road['risk_level'] = ai_eval['risk_level']
                if ai_eval['risk_level'] == 'CRITICAL':
                    road['road_status'] = 'BLOCKED'
                elif ai_eval['risk_level'] == 'HIGH':
                    road['road_status'] = 'HIGH_RISK'
                elif ai_eval['risk_level'] == 'MODERATE':
                    road['road_status'] = 'RESTRICTED'
                else:
                    road['road_status'] = 'ACCESSIBLE'

        roads_list.append(road)

    return roads_list

@map_bp.route('/roads', methods=['GET'])
def get_roads():
    return jsonify(get_live_roads_data()), 200

@map_bp.route('/locations', methods=['GET'])
def get_locations():
    loc_csv = os.path.join(DATA_DIR, 'locations.csv')
    if not os.path.exists(loc_csv):
        return jsonify([]), 200
    df = pd.read_csv(loc_csv)
    return jsonify(df.to_dict(orient='records')), 200

@map_bp.route('/map/data', methods=['GET'])
def get_full_map_data():
    roads = get_live_roads_data()

    # Load locations
    loc_csv = os.path.join(DATA_DIR, 'locations.csv')
    locations = pd.read_csv(loc_csv).to_dict(orient='records') if os.path.exists(loc_csv) else []

    # Load active disasters from DB / CSV
    dis_csv = os.path.join(DATA_DIR, 'disasters.csv')
    disasters = pd.read_csv(dis_csv).to_dict(orient='records') if os.path.exists(dis_csv) else []

    conn = get_db()
    cursor = conn.cursor()

    # Active alerts count
    cursor.execute("SELECT COUNT(*) FROM alerts WHERE status = 'ACTIVE'")
    active_alerts_count = cursor.fetchone()[0]

    # Field reports
    cursor.execute("SELECT * FROM field_reports ORDER BY id DESC LIMIT 20")
    field_reports = [dict(row) for row in cursor.fetchall()]

    # Active shipments count
    cursor.execute("SELECT COUNT(*) FROM shipments WHERE shipment_status IN ('In Transit', 'Rerouted', 'Delayed')")
    active_shipments_count = cursor.fetchone()[0]

    conn.close()

    # Calculate KPIs
    total_roads = len(roads)
    accessible = sum(1 for r in roads if r['road_status'] == 'ACCESSIBLE')
    restricted = sum(1 for r in roads if r['road_status'] == 'RESTRICTED')
    high_risk = sum(1 for r in roads if r['road_status'] == 'HIGH_RISK')
    critical = sum(1 for r in roads if r['road_status'] == 'BLOCKED')

    kpis = {
        'roads_monitored': total_roads,
        'accessible_roads': accessible,
        'restricted_roads': restricted,
        'high_risk_roads': high_risk,
        'critical_roads': critical,
        'active_alerts': active_alerts_count,
        'high_risk_zones': high_risk + critical,
        'active_logistics': active_shipments_count,
        'ai_predictions': total_roads * 4
    }

    return jsonify({
        'roads': roads,
        'locations': locations,
        'disasters': disasters,
        'field_reports': field_reports,
        'kpis': kpis
    }), 200
