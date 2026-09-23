"""
Machine Learning API routes for GLOBAL-SETU Platform
"""
import sys
import os
from flask import Blueprint, request, jsonify

# Ensure ml package is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ml.predict import get_model_status, predict_risk, load_model_and_meta
from ml.train_model import train_and_save_model

ml_bp = Blueprint('ml', __name__, url_prefix='/api/ml')

@ml_bp.route('/status', methods=['GET'])
def model_status():
    status = get_model_status()
    return jsonify(status), 200

@ml_bp.route('/train', methods=['POST'])
def trigger_training():
    try:
        new_meta = train_and_save_model()
        load_model_and_meta()
        return jsonify({
            'message': 'Random Forest Model successfully retrained!',
            'metadata': new_meta
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ml_bp.route('/reload', methods=['POST'])
def trigger_reload():
    model, meta = load_model_and_meta()
    if model is None:
        return jsonify({
            'status': 'NOT_TRAINED',
            'error': 'ML model not loaded. Please train or load the model.'
        }), 404
    return jsonify({
        'message': 'Model successfully reloaded into memory.',
        'metadata': meta
    }), 200

@ml_bp.route('/predict', methods=['POST'])
def run_prediction():
    data = request.get_json() or {}
    result = predict_risk(data)
    return jsonify(result), 200
