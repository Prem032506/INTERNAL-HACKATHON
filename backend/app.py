"""
Main Flask Application for GLOBAL-SETU Platform
AI-Based Smart Logistics & Disaster Accessibility Intelligence Platform (NER India)
"""
import os
import sys

# Ensure backend and root paths are in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from flask import Flask, jsonify, request
from flask_cors import CORS

from database.db_init import init_db
from routes.auth_routes import auth_bp
from routes.ml_routes import ml_bp
from routes.map_routes import map_bp
from routes.routing_routes import routing_bp
from routes.simulation_routes import simulation_bp
from routes.logistics_routes import logistics_bp
from routes.alerts_routes import alerts_bp, reports_bp
from routes.weather_routes import weather_bp, analytics_bp, diagnostics_bp

FRONTEND_DIST = os.path.join(ROOT_DIR, 'frontend', 'dist')
app = Flask(__name__, static_folder=FRONTEND_DIST if os.path.exists(FRONTEND_DIST) else None, static_url_path='/')
app.secret_key = 'global-setu-secure-local-session-key-ner-disaster-2026'

# Enable CORS for local React development and production live domains
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(ml_bp)
app.register_blueprint(map_bp)
app.register_blueprint(routing_bp)
app.register_blueprint(simulation_bp)
app.register_blueprint(logistics_bp)
app.register_blueprint(alerts_bp)
app.register_blueprint(reports_bp)
app.register_blueprint(weather_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(diagnostics_bp)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ONLINE',
        'platform': 'GLOBAL-SETU AI Command System',
        'region': 'North Eastern Region (NER) of India',
        'offline_mode': True,
        'version': '2.4.0'
    }), 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return app.send_static_file(path)
    if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
        return app.send_static_file('index.html')
    return jsonify({'status': 'ONLINE', 'platform': 'GLOBAL-SETU API'}), 200

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api'):
        return jsonify({'error': 'Resource not found', 'path': request.path}), 404
    if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
        return app.send_static_file('index.html')
    return jsonify({'error': 'Resource not found', 'path': request.path}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

if __name__ == '__main__':
    # Initialize DB schema if not already present
    init_db()
    port = int(os.environ.get('PORT', 5000))
    print(f"===========================================================")
    print(f" GLOBAL-SETU BACKEND ENGINE STARTED")
    print(f" Offline Mode: ACTIVE (Zero External APIs)")
    print(f" Running at: http://127.0.0.1:{port}")
    print(f"===========================================================")
    app.run(host='0.0.0.0', port=port, debug=True)
