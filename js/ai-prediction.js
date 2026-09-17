/**
 * AI Hazard Disruption Prediction & Terrain-Aware Routing Engine
 * Simulates XGBoost Landslide Vulnerability & Graph Neural Network Route Optimization
 */

class AIPredictionEngine {
  constructor() {
    this.rainfallThresholdMm = 85.0; // Daily threshold for high-altitude slope saturation
    this.soilMoistureSaturation = 0.78;
    this.activeSimulatedDisruptions = [];
  }

  /**
   * Calculates Landslide & Flood Hazard Vulnerability Index
   * Formula: HVI = 0.35*(Rainfall/MaxRain) + 0.30*(SlopeDeg/90) + 0.20*SoilSat + 0.15*HistoricalFreq
   */
  calculateSegmentRisk(corridorId, currentRainfallMm, slopeAngleDegrees, soilMoisture, historicalFactor = 0.8) {
    const rainNormalized = Math.min(1.0, currentRainfallMm / 150.0);
    const slopeNormalized = Math.min(1.0, slopeAngleDegrees / 60.0);
    const soilNormalized = Math.min(1.0, soilMoisture);
    
    const riskScore = (0.35 * rainNormalized) + (0.30 * slopeNormalized) + (0.20 * soilNormalized) + (0.15 * historicalFactor);
    const riskPercent = Math.round(riskScore * 100);

    let status = 'LOW';
    let color = '#10b981';
    let advisory = 'Normal passage. Keep standard convoy distance.';

    if (riskPercent >= 75) {
      status = 'CRITICAL';
      color = '#ef4444';
      advisory = 'High probability of slope failure/rockfall within 6 hours. Heavy goods divert to alternate corridor.';
    } else if (riskPercent >= 45) {
      status = 'WARNING';
      color = '#f59e0b';
      advisory = 'Single-lane caution advised. Escort vehicles recommended for cryo/medical tankers.';
    }

    return {
      corridorId,
      riskScore: riskPercent,
      status,
      color,
      advisory,
      rainParam: currentRainfallMm,
      slopeParam: slopeAngleDegrees
    };
  }

  /**
   * Computes Primary vs Alternate Routes with Terrain, Bridge Weight & Slope Penalties
   */
  optimizeRoute(originKey, destKey, cargoType = 'MEDICAL') {
    // Route Knowledge Graph for NER Arterial Highways
    const routesDatabase = {
      'Guwahati-Itanagar': {
        primary: {
          name: 'NH-15 via Tezpur - Banderdewa Pass',
          distanceKm: 330,
          baseTimeHours: 6.5,
          weatherDelayHours: 0.5,
          totalTimeHours: 7.0,
          hazardRisk: 'Low (18%)',
          bridgeLimitTons: 40,
          status: 'Operational',
          coordinates: [
            [26.1445, 91.7362],
            [26.4000, 92.2000],
            [26.6528, 92.7926],
            [26.8500, 93.3000],
            [27.0844, 93.6053]
          ]
        },
        alternate: {
          name: 'NH-115 via Gohpur - Holongi Corridor',
          distanceKm: 365,
          baseTimeHours: 7.2,
          weatherDelayHours: 0.2,
          totalTimeHours: 7.4,
          hazardRisk: 'Very Low (9%)',
          bridgeLimitTons: 50,
          status: 'All-Weather Redundant Bypass',
          coordinates: [
            [26.1445, 91.7362],
            [26.5000, 92.5000],
            [26.8000, 93.6000],
            [27.0844, 93.6053]
          ]
        }
      },
      'Guwahati-Kohima': {
        primary: {
          name: 'NH-29 via Nagaon - Dimapur - Kohima (Pagala Pahar Stretch)',
          distanceKm: 350,
          baseTimeHours: 7.5,
          weatherDelayHours: 5.5,
          totalTimeHours: 13.0,
          hazardRisk: 'CRITICAL (88% Sinking Zone)',
          bridgeLimitTons: 25,
          status: 'DISRUPTED (Active Mudslide)',
          coordinates: [
            [26.1445, 91.7362],
            [26.3500, 92.6800],
            [25.9068, 93.7273],
            [25.7800, 93.9400],
            [25.6751, 94.1086]
          ]
        },
        alternate: {
          name: 'AI Smart Alternate: Bokajan - Wokha Pass Bypass (NH-61)',
          distanceKm: 395,
          baseTimeHours: 8.8,
          weatherDelayHours: 0.8,
          totalTimeHours: 9.6,
          hazardRisk: 'Low-Moderate (32%)',
          bridgeLimitTons: 35,
          status: 'Recommended (Saves ~3.4 Hours)',
          coordinates: [
            [26.1445, 91.7362],
            [26.3500, 92.6800],
            [26.0100, 93.8000],
            [26.1000, 94.2500],
            [25.6751, 94.1086]
          ]
        }
      },
      'Siliguri-Gangtok': {
        primary: {
          name: 'NH-10 via Teesta Bazaar - Rangpo',
          distanceKm: 114,
          baseTimeHours: 3.5,
          weatherDelayHours: 4.0,
          totalTimeHours: 7.5,
          hazardRisk: 'HIGH (79% Teesta River Erosion)',
          bridgeLimitTons: 20,
          status: 'Partial Single Lane Blockage',
          coordinates: [
            [26.7271, 88.3953],
            [26.9000, 88.4800],
            [27.0500, 88.5100],
            [27.1767, 88.5306],
            [27.3389, 88.6065]
          ]
        },
        alternate: {
          name: 'AI Bypass: Lava - Algarah - Gorubathan Hill Ridge Route',
          distanceKm: 142,
          baseTimeHours: 4.8,
          weatherDelayHours: 0.5,
          totalTimeHours: 5.3,
          hazardRisk: 'Moderate (28%)',
          bridgeLimitTons: 30,
          status: 'Safe All-Weather Convoy Route',
          coordinates: [
            [26.7271, 88.3953],
            [26.8500, 88.7000],
            [27.0800, 88.6500],
            [27.2200, 88.6000],
            [27.3389, 88.6065]
          ]
        }
      },
      'Silchar-Aizawl': {
        primary: {
          name: 'NH-306 via Kolasib - Durtlang Ridge',
          distanceKm: 175,
          baseTimeHours: 5.5,
          weatherDelayHours: 1.0,
          totalTimeHours: 6.5,
          hazardRisk: 'Moderate (42%)',
          bridgeLimitTons: 30,
          status: 'Clear with Monsoon Caution',
          coordinates: [
            [24.8333, 92.7789],
            [24.4500, 92.6800],
            [24.2250, 92.6770],
            [23.9500, 92.7000],
            [23.7271, 92.7176]
          ]
        },
        alternate: {
          name: 'Secondary Route via Bairabi - Mamit Link Road',
          distanceKm: 215,
          baseTimeHours: 6.8,
          weatherDelayHours: 0.5,
          totalTimeHours: 7.3,
          hazardRisk: 'Low (22%)',
          bridgeLimitTons: 25,
          status: 'Standby Emergency Corridor',
          coordinates: [
            [24.8333, 92.7789],
            [24.1500, 92.5000],
            [23.9200, 92.4800],
            [23.7271, 92.7176]
          ]
        }
      }
    };

    const routeKey = `${originKey}-${destKey}`;
    const found = routesDatabase[routeKey] || routesDatabase['Guwahati-Kohima'];

    // Commodity specific handling
    let cargoAdvisory = 'Standard Logistics Protocol';
    if (cargoType === 'MEDICAL') {
      cargoAdvisory = 'CRITICAL COLD-CHAIN: Maximum allowable temperature deviation: 4 hours. Priority green corridor requested.';
    } else if (cargoType === 'FUEL') {
      cargoAdvisory = 'HAZMAT FUEL: Sharp mountain hairpins restricted during night hours (20:00 - 05:00 IST).';
    }

    return {
      origin: originKey,
      destination: destKey,
      cargoType,
      cargoAdvisory,
      primary: found.primary,
      alternate: found.alternate
    };
  }
}

window.aiEngine = new AIPredictionEngine();
