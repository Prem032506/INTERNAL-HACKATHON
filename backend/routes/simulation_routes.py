"""
Simulated Live Mode module for GLOBAL-SETU Platform
Simulates severe monsoon weather surges, re-runs ML predictions, creates alerts and updates logistics state.
"""
import os
import random
import pandas as pd
from flask import Blueprint, jsonify, request
from database.db import get_db
from ml.predict import predict_risk

simulation_bp = Blueprint('simulation', __name__, url_prefix='/api/simulate')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ROADS_CSV = os.path.join(BASE_DIR, 'data', 'roads.csv')

@simulation_bp.route('/heavy-rainfall', methods=['POST'])
def simulate_heavy_rainfall():
    """
    Triggers simulated extreme cloudburst and torrential monsoon rainfall across NER.
    Runs ML predictions, stores overrides in SQLite, generates system alerts, and updates affected routes.
    """
    if not os.path.exists(ROADS_CSV):
        return jsonify({'error': 'Roads dataset missing.'}), 500

    roads_df = pd.read_csv(ROADS_CSV)
    conn = get_db()
    cursor = conn.cursor()

    # Clear previous simulation state
    cursor.execute("DELETE FROM road_simulations")

    affected_roads = []
    generated_alerts = []

    # Regions heavily impacted in the simulation: East Khasi Hills, Assam Valley, Nagaland-Manipur corridor, Sikkim corridor
    for _, r in roads_df.iterrows():
        road = r.to_dict()
        road_id = road['road_id']
        base_rain = float(road['rainfall_mm'])
        
        # Surge rainfall between 75mm and 145mm depending on terrain
        terrain = str(road.get('terrain', 'Plain'))
        surge = random.uniform(85.0, 150.0) if terrain in ['Mountainous', 'Hilly'] else random.uniform(60.0, 110.0)
        sim_rainfall = round(base_rain + surge, 1)

        sim_road = dict(road)
        sim_road['rainfall_mm'] = sim_rainfall
        
        # If already poor or severe, increase degradation
        if road['road_condition'] in ['Fair', 'Poor'] and sim_rainfall > 200:
            sim_road['road_condition'] = 'Severe'
        elif road['road_condition'] == 'Good' and sim_rainfall > 180:
            sim_road['road_condition'] = 'Fair'

        # Run REAL ML prediction on the simulated environmental state
        pred = predict_risk(sim_road)
        new_risk_score = pred['risk_score']
        new_risk_level = pred['risk_level']

        # Determine road accessibility status
        if new_risk_level == 'CRITICAL' or new_risk_score >= 82:
            new_status = 'BLOCKED'
        elif new_risk_level == 'HIGH' or new_risk_score >= 60:
            new_status = 'HIGH_RISK'
        elif new_risk_level == 'MODERATE' or new_risk_score >= 38:
            new_status = 'RESTRICTED'
        else:
            new_status = 'ACCESSIBLE'

        # Save to SQLite simulation table
        cursor.execute("""
            INSERT OR REPLACE INTO road_simulations 
            (road_id, rainfall_added, current_rainfall, risk_score, risk_level, road_status, is_simulated)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (road_id, round(surge, 1), sim_rainfall, new_risk_score, new_risk_level, new_status))

        # Check if status degraded
        old_status = road['road_status']
        if new_status in ['HIGH_RISK', 'BLOCKED'] or new_status != old_status:
            affected_roads.append({
                'road_id': road_id,
                'name': road['name'],
                'old_status': old_status,
                'new_status': new_status,
                'old_rain': base_rain,
                'new_rain': sim_rainfall,
                'risk_score': new_risk_score,
                'risk_level': new_risk_level,
                'recommendation': pred['recommendation'],
                'factors': pred['risk_factors']
            })

            # Create an automatic alert for high-risk or blocked roads
            if new_status == 'BLOCKED' and old_status != 'BLOCKED':
                alert_title = f"EMERGENCY BLOCKAGE: {road['name']}"
                alert_cat = "Road Blockage"
                severity = "CRITICAL"
                desc = f"Simulated cloudburst ({sim_rainfall} mm) triggered rapid mud creep and river flooding. Road impassable; ML model flagged CRITICAL risk ({new_risk_score}/100)."
                cursor.execute("""
                    INSERT INTO alerts (title, severity, category, location, affected_road, description)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (alert_title, severity, alert_cat, f"{road['source']} - {road['destination']}", road['name'], desc))
                generated_alerts.append(alert_title)

            elif new_status == 'HIGH_RISK' and old_status not in ['HIGH_RISK', 'BLOCKED']:
                alert_title = f"HAZARD WARNING: {road['name']}"
                alert_cat = "Heavy Rainfall"
                severity = "HIGH"
                desc = f"Rainfall reached {sim_rainfall} mm. AI Risk Score escalated to {new_risk_score}/100. Logistics traffic must reroute."
                cursor.execute("""
                    INSERT INTO alerts (title, severity, category, location, affected_road, description)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (alert_title, severity, alert_cat, f"{road['source']} - {road['destination']}", road['name'], desc))
                generated_alerts.append(alert_title)

    conn.commit()
    conn.close()

    return jsonify({
        'status': 'SIMULATION_ACTIVE',
        'simulation_type': 'EXTREME_HEAVY_RAINFALL',
        'message': f"Simulated heavy rainfall across NER! ML evaluated {len(roads_df)} roads.",
        'affected_roads_count': len(affected_roads),
        'affected_roads': affected_roads[:8], # return top affected
        'generated_alerts_count': len(generated_alerts),
        'generated_alerts': generated_alerts
    }), 200

@simulation_bp.route('/reset', methods=['POST'])
def reset_simulation():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM road_simulations")
    # Resolve simulation-generated alerts
    cursor.execute("UPDATE alerts SET status = 'RESOLVED' WHERE title LIKE 'EMERGENCY BLOCKAGE%' OR title LIKE 'HAZARD WARNING%'")
    conn.commit()
    conn.close()

    return jsonify({
        'status': 'BASELINE_ACTIVE',
        'message': 'Simulation overrides cleared. Restored baseline local dataset and AI road scores.'
    }), 200

@simulation_bp.route('/status', methods=['GET'])
def simulation_status():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM road_simulations WHERE is_simulated = 1")
    count = cursor.fetchone()[0]
    conn.close()

    return jsonify({
        'is_simulating': count > 0,
        'simulated_roads_count': count
    }), 200
