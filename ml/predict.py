"""
Inference module for GLOBAL-SETU Road Risk Intelligence Platform
Provides real-time AI risk prediction, confidence scoring, factor analysis and recommendations.
"""
import os
import json
import joblib
import numpy as np

try:
    from ml.preprocess import extract_single_feature_vector, REV_RISK_MAP
except ImportError:
    from preprocess import extract_single_feature_vector, REV_RISK_MAP

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'ml', 'model.pkl')
META_PATH = os.path.join(BASE_DIR, 'ml', 'model_meta.json')

_MODEL = None
_METADATA = None

def load_model_and_meta():
    global _MODEL, _METADATA
    if os.path.exists(MODEL_PATH):
        try:
            _MODEL = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"Error loading model: {e}")
            _MODEL = None
    else:
        _MODEL = None

    if os.path.exists(META_PATH):
        try:
            with open(META_PATH, 'r') as f:
                _METADATA = json.load(f)
        except Exception as e:
            print(f"Error loading metadata: {e}")
            _METADATA = None
    else:
        _METADATA = None

    return _MODEL, _METADATA

def get_model_status():
    global _MODEL, _METADATA
    if _MODEL is None or _METADATA is None:
        load_model_and_meta()

    if _MODEL is None:
        return {
            'model_name': 'NER Road Accessibility Random Forest Classifier',
            'algorithm': 'RandomForestClassifier',
            'dataset_source': 'Local Dataset (Pending Training)',
            'dataset_samples': 0,
            'accuracy_pct': 0.0,
            'features': [],
            'feature_importances': {},
            'last_trained': 'Never',
            'status': 'NOT_TRAINED',
            'error_message': 'ML model not loaded. Please train or load the model.'
        }
    
    return _METADATA

def predict_risk(feature_dict):
    """
    Executes actual ML inference on a given road's features.
    Returns:
        risk_score (0-100)
        risk_level (LOW, MODERATE, HIGH, CRITICAL)
        confidence (%)
        risk_factors (list of explanations)
        recommendation (actionable decision)
    """
    global _MODEL
    if _MODEL is None:
        load_model_and_meta()

    if _MODEL is None:
        return {
            'error': 'ML model not loaded. Please train or load the model.',
            'risk_score': 50,
            'risk_level': 'MODERATE',
            'confidence': 50.0,
            'risk_factors': ['Model not trained. Using rule-based fallback.'],
            'recommendation': 'Train the Random Forest model from the AI Model panel.'
        }

    vec = extract_single_feature_vector(feature_dict)
    
    # Probabilities across [LOW, MODERATE, HIGH, CRITICAL]
    probs = _MODEL.predict_proba(vec)[0]
    pred_idx = int(np.argmax(probs))
    pred_level = REV_RISK_MAP.get(pred_idx, 'MODERATE')
    confidence = round(float(probs[pred_idx]) * 100, 1)

    # Weighted composite risk score from 0 to 100
    # Weights for class centers: LOW=15, MODERATE=45, HIGH=75, CRITICAL=96
    class_weights = [15.0, 45.0, 75.0, 96.0]
    raw_score = sum(p * w for p, w in zip(probs, class_weights))
    
    # Scale and clamp between 5 and 99
    risk_score = int(np.clip(round(raw_score), 5, 99))

    # Dynamic factor identification
    factors = []
    rainfall = float(feature_dict.get('rainfall_mm', 0))
    road_cond = str(feature_dict.get('road_condition', 'Good')).capitalize()
    terrain = str(feature_dict.get('terrain', 'Plain')).capitalize()
    elevation = float(feature_dict.get('elevation_m', 0))
    flood_hist = int(feature_dict.get('flood_history', 0))
    landslide_hist = int(feature_dict.get('landslide_history', 0))
    incidents = int(feature_dict.get('historical_incidents', 0))
    infra = float(feature_dict.get('infrastructure_rating', 7.0))
    traffic = str(feature_dict.get('traffic_density', 'Medium')).capitalize()

    if rainfall >= 180:
        factors.append(f"Extreme torrential rainfall ({rainfall:.0f} mm) saturating hill slopes")
    elif rainfall >= 110:
        factors.append(f"Heavy rainfall ({rainfall:.0f} mm) exceeding local drainage capacity")
    elif rainfall >= 65:
        factors.append(f"Continuous moderate showers ({rainfall:.0f} mm) reducing traction")

    if road_cond == 'Severe':
        factors.append("Severe structural road degradation and erosion")
    elif road_cond == 'Poor':
        factors.append("Poor asphalt condition with unpaved bypass sections")

    if landslide_hist == 1 and terrain in ['Hilly', 'Mountainous']:
        factors.append("Active landslide zone with documented slope instability")

    if flood_hist == 1:
        factors.append("Low-lying floodplain subject to flash river surges")

    if elevation >= 1200:
        factors.append(f"High altitude corridor ({elevation:.0f} m) vulnerable to cloudbursts and fog")

    if incidents >= 10:
        factors.append(f"High incident history ({incidents} past blockages recorded)")

    if infra <= 5.0:
        factors.append(f"Sub-standard bridge and culvert resilience (Rating: {infra}/10)")

    if traffic == 'High':
        factors.append("High logistics traffic causing potential bottleneck if slowed")

    if not factors:
        factors.append("Normal terrain and benign weather conditions")

    # Actionable AI Recommendation
    if pred_level == 'CRITICAL':
        recommendation = "Road impassable or critically compromised. Halt all heavy logistics convoys and redirect traffic via secondary regional bypass."
    elif pred_level == 'HIGH':
        recommendation = "High disaster hazard detected. Restrict heavy commercial transit; dispatch pilot scout vehicle before routing essential relief convoys."
    elif pred_level == 'MODERATE':
        recommendation = "Cautionary status. Enforce speed reduction to 40 km/h, maintain 200m vehicle spacing, and monitor rainfall updates."
    else:
        recommendation = "Standard operating conditions. Road is clear and fully accessible for priority relief and commercial distribution."

    return {
        'risk_score': risk_score,
        'risk_level': pred_level,
        'confidence': confidence,
        'probabilities': {
            'LOW': round(float(probs[0]) * 100, 1),
            'MODERATE': round(float(probs[1]) * 100, 1),
            'HIGH': round(float(probs[2]) * 100, 1),
            'CRITICAL': round(float(probs[3]) * 100, 1)
        },
        'risk_factors': factors,
        'recommendation': recommendation
    }
