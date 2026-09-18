/**
 * AI Hazard Disruption Prediction & Terrain-Aware Routing Engine
 * Supports Multi-Region Geographies: North East India, Himalayan Arc, Alps, Andes
 */

class AIPredictionEngine {
  constructor() {
    this.rainfallThresholdMm = 85.0; // Daily threshold for high-altitude slope saturation
    this.soilMoistureSaturation = 0.78;
    this.activeSimulatedDisruptions = [];

    this.hubCoordinates = {
      // North East India (NER)
      'Guwahati': [26.1445, 91.7362],
      'Siliguri': [26.7271, 88.3953],
      'Shillong': [25.5788, 91.8933],
      'Imphal': [24.8170, 93.9368],
      'Aizawl': [23.7271, 92.7176],
      'Kohima': [25.6751, 94.1086],
      'Dimapur': [25.9068, 93.7273],
      'Agartala': [23.8315, 91.2868],
      'Gangtok': [27.3389, 88.6065],
      'Itanagar': [27.0844, 93.6053],
      'Tawang': [27.5860, 91.8594],
      'Tezpur': [26.6528, 92.7926],
      'Dibrugarh': [27.4728, 94.9120],
      'Silchar': [24.8333, 92.7789],
      'Cherrapunji': [25.2702, 91.7323],
      'Ukhrul': [25.1167, 94.3667],
      'Lunglei': [22.8833, 92.7333],

      // Northern Himalayan Arc
      'Srinagar': [34.0837, 74.7973],
      'Leh': [34.1526, 77.5771],
      'Kargil': [34.5539, 76.1349],
      'Manali': [32.2396, 77.1887],
      'Shimla': [31.1048, 77.1734],
      'Dehradun': [30.3165, 78.0322],
      'Joshimath': [30.5564, 79.5670],
      'Rishikesh': [30.0869, 78.2676],
      'Keylong': [32.5710, 77.0320],
      'Badrinath': [30.7433, 79.4938],
      'Dharamshala': [32.2190, 76.3234],

      // European Alps
      'Zurich': [47.3769, 8.5417],
      'Milan': [45.4642, 9.1900],
      'Geneva': [46.2044, 6.1432],
      'Innsbruck': [47.2692, 11.4041],
      'Bellinzona': [46.1953, 9.0238],
      'Bern': [46.9480, 7.4474],
      'Turin': [45.0703, 7.6869],

      // South American Andes
      'Santiago': [-33.4489, -70.6693],
      'Mendoza': [-32.8895, -68.8458],
      'Valparaíso': [-33.0472, -71.6127],
      'Los Andes': [-32.8337, -70.5983],
      'Uspallata': [-32.5936, -69.3475],
      'La Paz': [-16.4897, -68.1193]
    };
  }

  /**
   * Calculates Landslide & Flood Hazard Vulnerability Index
   * Formula: HVI = 0.35*(Rainfall/MaxRain) + 0.30*(SlopeDeg/60) + 0.20*SoilSat + 0.15*HistoricalFreq
   */
  calculateSegmentRisk(corridorId, currentRainfallMm, slopeAngleDegrees, soilMoisture, historicalFactor = 0.8) {
    const rainNormalized = Math.min(1.0, currentRainfallMm / 150.0);
    const slopeNormalized = Math.min(1.0, slopeAngleDegrees / 60.0);
    const soilNormalized = Math.min(1.0, soilMoisture);
    
    const riskScore = (0.35 * rainNormalized) + (0.30 * slopeNormalized) + (0.20 * soilNormalized) + (0.15 * historicalFactor);
    const riskPercent = Math.round(riskScore * 100);

    let status = 'LOW';
    let color = '#10b981';
    let advisory = 'Normal passage. Maintain convoy spacing.';

    if (riskPercent >= 75) {
      status = 'CRITICAL';
      color = '#ef4444';
      advisory = 'High probability of slope failure/rockfall within 6 hours. Divert heavy goods to alternate bypass.';
    } else if (riskPercent >= 45) {
      status = 'WARNING';
      color = '#f59e0b';
      advisory = 'Single-lane caution advised. Escort convoy recommended for cryo/medical tankers.';
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
  optimizeRoute(originKey, destKey, cargoType = 'MEDICAL', vehicleType = 'HEAVY_4X4', strategy = 'MAX_RESILIENCE') {
    const routesDatabase = {
      // 1. North East Region India (NER)
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
      'Guwahati-Itanagar': {
        primary: {
          name: 'NH-15 via Tezpur - Banderdewa Pass',
          distanceKm: 330,
          baseTimeHours: 6.5,
          weatherDelayHours: 1.5,
          totalTimeHours: 8.0,
          hazardRisk: 'Moderate (48% Monsoon Overwash)',
          bridgeLimitTons: 40,
          status: 'Heavy Rain Alert',
          coordinates: [
            [26.1445, 91.7362],
            [26.4000, 92.2000],
            [26.6528, 92.7926],
            [26.8500, 93.3000],
            [27.0844, 93.6053]
          ]
        },
        alternate: {
          name: 'NH-115 via Gohpur - Holongi High-Clearance Bypass',
          distanceKm: 365,
          baseTimeHours: 7.2,
          weatherDelayHours: 0.2,
          totalTimeHours: 7.4,
          hazardRisk: 'Very Low (12%)',
          bridgeLimitTons: 50,
          status: 'All-Weather Recommended Bypass',
          coordinates: [
            [26.1445, 91.7362],
            [26.5000, 92.5000],
            [26.8000, 93.6000],
            [27.0844, 93.6053]
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
          hazardRisk: 'HIGH (82% Teesta River Erosion)',
          bridgeLimitTons: 20,
          status: 'Partial Single-Lane Blockage',
          coordinates: [
            [26.7271, 88.3953],
            [26.9000, 88.4800],
            [27.0500, 88.5100],
            [27.1767, 88.5306],
            [27.3389, 88.6065]
          ]
        },
        alternate: {
          name: 'AI Ridge Bypass: Lava - Algarah - Gorubathan All-Weather Corridor',
          distanceKm: 142,
          baseTimeHours: 4.6,
          weatherDelayHours: 0.5,
          totalTimeHours: 5.1,
          hazardRisk: 'Moderate (24%)',
          bridgeLimitTons: 30,
          status: 'Safe All-Weather Convoy Route (Saves 2.4h)',
          coordinates: [
            [26.7271, 88.3953],
            [26.8500, 88.7000],
            [27.0800, 88.6500],
            [27.2200, 88.6000],
            [27.3389, 88.6065]
          ]
        }
      },

      // 2. Northern Himalayan Arc
      'Srinagar-Leh': {
        primary: {
          name: 'NH-1 via Sonamarg - Zoji La Pass - Kargil (High-Altitude Chokepoint)',
          distanceKm: 420,
          baseTimeHours: 9.5,
          weatherDelayHours: 6.0,
          totalTimeHours: 15.5,
          hazardRisk: 'CRITICAL (91% Blizzard / Avalanche Danger)',
          bridgeLimitTons: 24,
          status: 'Severe Snow Squalls at Zoji La',
          coordinates: [
            [34.0837, 74.7973],
            [34.2800, 75.1500],
            [34.3000, 75.4000],
            [34.5500, 76.1300],
            [34.3000, 76.8000],
            [34.1526, 77.5771]
          ]
        },
        alternate: {
          name: 'AI Priority Convoy: Z-Morh Tunnel Bypass with 4x4 Snow Escort',
          distanceKm: 435,
          baseTimeHours: 10.0,
          weatherDelayHours: 1.2,
          totalTimeHours: 11.2,
          hazardRisk: 'Moderate (35%)',
          bridgeLimitTons: 32,
          status: 'Cleared All-Weather Military & Relief Corridor',
          coordinates: [
            [34.0837, 74.7973],
            [34.2500, 75.2000],
            [34.3800, 75.6000],
            [34.5000, 76.2000],
            [34.2000, 77.0000],
            [34.1526, 77.5771]
          ]
        }
      },

      // 3. European Alps
      'Zurich-Milan': {
        primary: {
          name: 'A2 Trans-Alpine Corridor via Gotthard Road Tunnel',
          distanceKm: 280,
          baseTimeHours: 3.5,
          weatherDelayHours: 3.5,
          totalTimeHours: 7.0,
          hazardRisk: 'HIGH (76% Heavy Freight Metering & Alpine Snow)',
          bridgeLimitTons: 40,
          status: 'Heavy Congestion & Metering Active',
          coordinates: [
            [47.3769, 8.5417],
            [46.9000, 8.6000],
            [46.6000, 8.5800],
            [46.2000, 9.0000],
            [45.4642, 9.1900]
          ]
        },
        alternate: {
          name: 'AI Resilient Alpine Routing: A13 via San Bernardino Tunnel & Bellinzona',
          distanceKm: 315,
          baseTimeHours: 4.1,
          weatherDelayHours: 0.4,
          totalTimeHours: 4.5,
          hazardRisk: 'Low (18%)',
          bridgeLimitTons: 44,
          status: 'Optimal Flow Corridor (Saves 2.5 Hours)',
          coordinates: [
            [47.3769, 8.5417],
            [47.1000, 9.2000],
            [46.8500, 9.5000],
            [46.4900, 9.1800],
            [45.4642, 9.1900]
          ]
        }
      },

      // 4. South American Andes
      'Santiago-Mendoza': {
        primary: {
          name: 'Ruta 60 / RN 7 via Paso Internacional Los Libertadores (Cristo Redentor)',
          distanceKm: 360,
          baseTimeHours: 6.0,
          weatherDelayHours: 7.5,
          totalTimeHours: 13.5,
          hazardRisk: 'CRITICAL (94% Andean Whiteout / High Wind Ice)',
          bridgeLimitTons: 30,
          status: 'Pass Temporarily Closed to Standard Freight',
          coordinates: [
            [-33.4489, -70.6693],
            [-32.9000, -70.4000],
            [-32.8200, -70.0800],
            [-32.8300, -69.7500],
            [-32.8895, -68.8458]
          ]
        },
        alternate: {
          name: 'AI Southern Andean Relief Pass: Priority Clearance via Uspallata Shield',
          distanceKm: 398,
          baseTimeHours: 7.2,
          weatherDelayHours: 1.0,
          totalTimeHours: 8.2,
          hazardRisk: 'Moderate (30%)',
          bridgeLimitTons: 38,
          status: 'Active Priority Humanitarian Convoy Route',
          coordinates: [
            [-33.4489, -70.6693],
            [-33.2000, -70.3000],
            [-32.9500, -69.9000],
            [-32.7000, -69.3000],
            [-32.8895, -68.8458]
          ]
        }
      }
    };

    const routeKey = `${originKey}-${destKey}`;
    let found = routesDatabase[routeKey];

    // If exact pair isn't in predefined table, synthesize dynamically based on coordinates
    if (!found) {
      const origCoord = this.hubCoordinates[originKey] || [26.1445, 91.7362];
      const destCoord = this.hubCoordinates[destKey] || [25.6751, 94.1086];

      // Realistic Haversine distance
      const R = 6371;
      const dLat = (destCoord[0] - origCoord[0]) * Math.PI / 180;
      const dLon = (destCoord[1] - origCoord[1]) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(origCoord[0] * Math.PI / 180) * Math.cos(destCoord[0] * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const directKm = Math.round(R * c);

      const primaryKm = Math.max(85, Math.round(directKm * 1.38));
      const alternateKm = Math.max(98, Math.round(primaryKm * 1.14));

      // Speed calibrated for mountain vehicle class
      let speedKmH = 40;
      if (vehicleType === 'LIGHT_4WD') speedKmH = 52;
      else if (vehicleType === 'HAZMAT') speedKmH = 34;
      else if (vehicleType === 'REEFER') speedKmH = 42;
      else if (vehicleType === 'ELECTRIC') speedKmH = 38;

      const baseTime = Number((primaryKm / speedKmH).toFixed(1));
      const altBaseTime = Number((alternateKm / (speedKmH * 1.06)).toFixed(1));

      // Delay calibrated by strategy
      let weatherDelay = 4.2;
      let altWeatherDelay = 0.6;
      let altRisk = 'LOW (16% Monitored Ridge)';
      let bridgeRating = 35;

      if (strategy === 'WEATHER_SHIELD') {
        weatherDelay = 2.0;
        altWeatherDelay = 0.3;
        altRisk = 'Very Low (9% Cleared Corridor)';
      } else if (strategy === 'FASTEST') {
        weatherDelay = 3.5;
        altWeatherDelay = 0.8;
      } else if (strategy === 'BRIDGE_CAPACITY') {
        bridgeRating = 45;
        altRisk = 'Low (Heavy Axle Verified)';
      }

      const midLat = (origCoord[0] + destCoord[0]) / 2;
      const midLng = (origCoord[1] + destCoord[1]) / 2;

      found = {
        primary: {
          name: `Standard Direct Corridor (${originKey} - ${destKey})`,
          distanceKm: primaryKm,
          baseTimeHours: baseTime,
          weatherDelayHours: weatherDelay,
          totalTimeHours: Number((baseTime + weatherDelay).toFixed(1)),
          hazardRisk: 'CRITICAL (High Landslide/Snow Vulnerability)',
          bridgeLimitTons: vehicleType === 'HEAVY_4X4' ? 30 : 25,
          status: 'DISRUPTED (Monitored Chokepoints)',
          coordinates: [
            origCoord,
            [origCoord[0] + (midLat - origCoord[0]) * 0.5, origCoord[1] + (midLng - origCoord[1]) * 0.5],
            [midLat, midLng],
            [midLat + (destCoord[0] - midLat) * 0.5, midLng + (destCoord[1] - midLng) * 0.5],
            destCoord
          ]
        },
        alternate: {
          name: `AI Resilient Bypass Corridor (${originKey} - ${destKey})`,
          distanceKm: alternateKm,
          baseTimeHours: altBaseTime,
          weatherDelayHours: altWeatherDelay,
          totalTimeHours: Number((altBaseTime + altWeatherDelay).toFixed(1)),
          hazardRisk: altRisk,
          bridgeLimitTons: bridgeRating,
          status: 'Recommended All-Weather Bypass',
          coordinates: [
            origCoord,
            [origCoord[0] + 0.15, origCoord[1] + 0.2],
            [midLat + 0.25, midLng + 0.15],
            [destCoord[0] - 0.1, destCoord[1] - 0.15],
            destCoord
          ]
        }
      };
    }

    // Commodity specific advisory
    let cargoAdvisory = 'Standard Relief Logistics Protocol';
    if (cargoType === 'MEDICAL') {
      cargoAdvisory = 'CRITICAL COLD-CHAIN: Strict WHO 2–8°C limit. Max allowable delay: 4 hours. Priority green convoy escort authorized.';
    } else if (cargoType === 'BLOOD_PLASMA') {
      cargoAdvisory = 'EMERGENCY CRYO-LIFE: Ultra-low temp transport (-20°C). Zero checkpoint stoppage authorized. Direct green corridor.';
    } else if (cargoType === 'FUEL') {
      cargoAdvisory = 'HAZMAT POL FUEL: Sharp hairpin passes restricted during night hours (20:00 - 05:00 Local). Fire-retardant escort required.';
    } else if (cargoType === 'FOOD_SECURITY') {
      cargoAdvisory = 'WFP / FCI BULK GRAIN: Moisture & tarpaulin shielding mandatory through humid river valley stretches.';
    } else if (cargoType === 'EMERGENCY') {
      cargoAdvisory = 'UN / NDRF DISASTER CONVOY: Immediate priority passability across all state border checkpoints.';
    } else if (cargoType === 'WATER') {
      cargoAdvisory = 'EMERGENCY DRINKING WATER: Potable bulk hydration units with fast-discharge manifolds for affected districts.';
    } else if (cargoType === 'HEAVY_PLANT') {
      cargoAdvisory = 'BRO / RESCUE EXCAVATION: Multi-axle heavy transport with forward pilot escort and bridge load verification.';
    }

    const vehicleLabels = {
      'HEAVY_4X4': '🚛 4x4 Heavy Logistics Truck',
      'REEFER': '❄️ Cryo-Reefer Insulated Van (2-8°C)',
      'HAZMAT': '⛽ Hazmat Petroleum Tanker',
      'LIGHT_4WD': '🚐 Light Mountain Quick-Response 4WD',
      'ELECTRIC': '⚡ Heavy Hybrid/Electric Hauler'
    };

    const strategyLabels = {
      'MAX_RESILIENCE': '🛡️ Max Hazard Avoidance',
      'FASTEST': '⚡ Fastest Safe Transit',
      'BRIDGE_CAPACITY': '🌉 Heavy Bridge Capacity (>35T)',
      'WEATHER_SHIELD': '🌧️ Weather & Monsoon Shielding'
    };

    return {
      origin: originKey,
      destination: destKey,
      cargoType,
      cargoAdvisory,
      vehicleType,
      vehicleLabel: vehicleLabels[vehicleType] || '🚛 Heavy Logistics Carrier',
      strategy,
      strategyLabel: strategyLabels[strategy] || '🛡️ Disaster-Resilient Routing',
      primary: found.primary,
      alternate: found.alternate
    };
  }
}

window.aiEngine = new AIPredictionEngine();
