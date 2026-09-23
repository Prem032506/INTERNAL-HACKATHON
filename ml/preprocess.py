"""
Pre-processing pipeline for GLOBAL-SETU Road Risk Intelligence
"""
import numpy as np
import pandas as pd

ROAD_CONDITION_MAP = {'Good': 0, 'Fair': 1, 'Poor': 2, 'Severe': 3}
TERRAIN_MAP = {'Plain': 0, 'Hilly': 1, 'Mountainous': 2}
TRAFFIC_MAP = {'Low': 0, 'Medium': 1, 'High': 2}
RISK_LEVEL_MAP = {'LOW': 0, 'MODERATE': 1, 'HIGH': 2, 'CRITICAL': 3}
REV_RISK_MAP = {0: 'LOW', 1: 'MODERATE', 2: 'HIGH', 3: 'CRITICAL'}

FEATURE_COLS = [
    'rainfall_mm',
    'temp_c',
    'humidity_pct',
    'road_condition_num',
    'terrain_num',
    'elevation_m',
    'historical_incidents',
    'flood_history',
    'landslide_history',
    'traffic_density_num',
    'infrastructure_rating'
]

def preprocess_dataframe(df):
    """
    Cleans and encodes input dataframe for ML training or inference.
    """
    df_clean = df.copy()

    # Map categorical features if strings
    if 'road_condition' in df_clean.columns:
        df_clean['road_condition_num'] = df_clean['road_condition'].map(
            lambda x: ROAD_CONDITION_MAP.get(str(x).capitalize(), 1)
        )
    elif 'road_condition_num' not in df_clean.columns:
        df_clean['road_condition_num'] = 1

    if 'terrain' in df_clean.columns:
        df_clean['terrain_num'] = df_clean['terrain'].map(
            lambda x: TERRAIN_MAP.get(str(x).capitalize(), 1)
        )
    elif 'terrain_num' not in df_clean.columns:
        df_clean['terrain_num'] = 1

    if 'traffic_density' in df_clean.columns:
        df_clean['traffic_density_num'] = df_clean['traffic_density'].map(
            lambda x: TRAFFIC_MAP.get(str(x).capitalize(), 1)
        )
    elif 'traffic_density_num' not in df_clean.columns:
        df_clean['traffic_density_num'] = 1

    # Ensure numeric columns
    numeric_cols = ['rainfall_mm', 'temp_c', 'humidity_pct', 'elevation_m',
                    'historical_incidents', 'flood_history', 'landslide_history',
                    'infrastructure_rating']

    for col in numeric_cols:
        if col in df_clean.columns:
            df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce').fillna(0)
        else:
            df_clean[col] = 0.0

    X = df_clean[FEATURE_COLS]
    return X

def extract_single_feature_vector(feature_dict):
    """
    Converts a single road dictionary into a 2D numpy array ready for model prediction.
    """
    row = {
        'rainfall_mm': float(feature_dict.get('rainfall_mm', 50)),
        'temp_c': float(feature_dict.get('temp_c', 25)),
        'humidity_pct': float(feature_dict.get('humidity_pct', 70)),
        'road_condition_num': ROAD_CONDITION_MAP.get(str(feature_dict.get('road_condition', 'Good')).capitalize(), 1),
        'terrain_num': TERRAIN_MAP.get(str(feature_dict.get('terrain', 'Plain')).capitalize(), 1),
        'elevation_m': float(feature_dict.get('elevation_m', 200)),
        'historical_incidents': float(feature_dict.get('historical_incidents', 2)),
        'flood_history': int(feature_dict.get('flood_history', 0)),
        'landslide_history': int(feature_dict.get('landslide_history', 0)),
        'traffic_density_num': TRAFFIC_MAP.get(str(feature_dict.get('traffic_density', 'Medium')).capitalize(), 1),
        'infrastructure_rating': float(feature_dict.get('infrastructure_rating', 7.0))
    }
    
    df_single = pd.DataFrame([row])[FEATURE_COLS]
    return df_single
