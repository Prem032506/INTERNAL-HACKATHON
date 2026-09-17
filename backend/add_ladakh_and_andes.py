import sqlite3
import pandas as pd
import json
import os

LADAKH_VEHICLES = [
    (1, 'Bike', 'LA-01-AB-1021', 'Tashi Dorjay', 'Ladakh', 34.1526, 77.5771),
    (2, 'Bike', 'LA-01-AB-1022', 'Stanzin Angmo', 'Ladakh', 34.1610, 77.5850),
    (3, 'Bike', 'LA-01-AB-1023', 'Sonam Dorje', 'Ladakh', 34.1450, 77.5680),
    (4, 'Bike', 'LA-01-AB-1024', 'Tsewang Norbu', 'Ladakh', 34.1690, 77.5930),
    (5, 'Bike', 'LA-01-AB-1025', 'Rigzin Tsering', 'Ladakh', 34.1380, 77.5600),
    (6, 'Bike', 'LA-01-AB-1026', 'Namgyal Wangchuk', 'Ladakh', 34.1770, 77.6010),
    (7, 'Bike', 'LA-01-AB-1027', 'Lobzang Tashi', 'Ladakh', 34.1300, 77.5520),
    (8, 'Bike', 'LA-01-AB-1028', 'Thinles Angmo', 'Ladakh', 34.1850, 77.6090),
    (9, 'Bike', 'LA-01-AB-1029', 'Padma Dorje', 'Ladakh', 34.1220, 77.5440),
    (10, 'Bike', 'LA-01-AB-1030', 'Karma Norbu', 'Ladakh', 34.1930, 77.6170),
    (11, 'Car', 'LA-01-AC-2011', 'Tashi Namgyal', 'Ladakh', 34.1526, 77.5771),
    (12, 'Car', 'LA-01-AC-2012', 'Sonam Tsering', 'Ladakh', 34.1560, 77.5800),
    (13, 'Car', 'LA-01-AC-2013', 'Stanzin Dorje', 'Ladakh', 34.1480, 77.5720),
    (14, 'Car', 'LA-01-AC-2014', 'Tsewang Phuntsok', 'Ladakh', 34.1640, 77.5880),
    (15, 'Car', 'LA-01-AC-2015', 'Rigzin Namgyal', 'Ladakh', 34.1400, 77.5640),
    (16, 'Car', 'LA-01-AC-2016', 'Dorje Wangchuk', 'Ladakh', 34.1720, 77.5960),
    (17, 'Car', 'LA-01-AC-2017', 'Pema Tsering', 'Ladakh', 34.1320, 77.5560),
    (18, 'Car', 'LA-01-AC-2018', 'Norbu Stanzin', 'Ladakh', 34.1800, 77.6040),
    (19, 'Car', 'LA-01-AC-2019', 'Angchuk Dorje', 'Ladakh', 34.1250, 77.5480),
    (20, 'SUV', 'LA-01-AD-3011', 'Tsering Angmo', 'Ladakh', 34.5500, 76.1300),
    (21, 'SUV', 'LA-01-AD-3012', 'Sonam Wangchuk', 'Ladakh', 34.5600, 76.1400),
    (22, 'Jeep', 'LA-01-AE-4011', 'Namgyal Dorje', 'Ladakh', 34.2800, 77.6000),
    (23, 'Van', 'LA-01-AF-5011', 'Tashi Phuntsok', 'Ladakh', 34.5800, 77.5000),
    (24, 'Pickup Truck', 'LA-01-AG-6011', 'Tsewang Norbu', 'Ladakh', 34.4200, 76.8000),
    (25, 'Mini Truck', 'LA-01-AH-7011', 'Karma Tsering', 'Ladakh', 34.1526, 77.5771),
    (26, 'Mini Truck', 'LA-01-AH-7012', 'Lobzang Dorje', 'Ladakh', 34.1570, 77.5820),
    (27, 'Truck', 'LA-01-AJ-8011', 'Stanzin Norbu', 'Ladakh', 34.2800, 75.1500),
    (28, 'Auto Rickshaw', 'LA-01-AK-9011', 'Pema Dorje', 'Ladakh', 34.1510, 77.5750),
    (29, 'Bus', 'LA-01-AL-1001', 'Rigzin Wangchuk', 'Ladakh', 34.1530, 77.5790),
    (30, 'Ambulance', 'LA-01-AM-1101', 'Sonam Namgyal', 'Ladakh', 34.1520, 77.5760),
]

ANDES_50_LANDMARKS = [
    {"id": 1, "name": "Santiago Capital Hub", "country": "Chile", "region": "Región Metropolitana", "category": "Urban Logistics Capital", "lat": -33.4489, "lng": -70.6693, "elevation": 570, "route": "Route 68 / Route 5 / Costanera Norte", "hazard": "High Urban Density", "desc": "National capital and primary distribution command hub of Central Chile."},
    {"id": 2, "name": "Mendoza Distribution Center", "country": "Argentina", "region": "Mendoza", "category": "Intermodal Freight Terminal", "lat": -32.8895, "lng": -68.8458, "elevation": 750, "route": "RN 7 / RN 40", "hazard": "Low", "desc": "Primary logistical capital on the Argentine eastern slope of the Andes."},
    {"id": 3, "name": "San Antonio Deepwater Port", "country": "Chile", "region": "Valparaíso", "category": "Maritime Container Port", "lat": -33.5936, "lng": -71.6167, "elevation": 5, "route": "Route 78 (Autopista del Sol)", "hazard": "Coastal Fog / Sea Swell", "desc": "Chile's largest container shipping terminal connected to the trans-Andean corridor."},
    {"id": 4, "name": "Valparaíso Commercial Port", "country": "Chile", "region": "Valparaíso", "category": "Historic Pacific Port", "lat": -33.0472, "lng": -71.6127, "elevation": 10, "route": "Route 68", "hazard": "Coastal Hills / Tsunami Risk", "desc": "Historic seaport terminal handling breakbulk and intermodal freight."},
    {"id": 5, "name": "Paso Los Libertadores (Cristo Redentor)", "country": "Chile / Argentina", "region": "Border Pass", "category": "Trans-Andean Border Pass", "lat": -32.8256, "lng": -70.0825, "elevation": 3200, "route": "Route 60 (CL) / RN 7 (AR)", "hazard": "Severe Blizzards / Heavy Snow", "desc": "Crucial high-altitude international tunnel linking Chile and Argentina (Mercosur Lifeline)."},
    {"id": 6, "name": "Portillo Alpine Base", "country": "Chile", "region": "Valparaíso", "category": "High-Altitude Staging Base", "lat": -32.8361, "lng": -70.1294, "elevation": 2880, "route": "Route 60", "hazard": "Heavy Snow / Freezing Ice", "desc": "Emergency staging base and ski center immediately below the international tunnel."},
    {"id": 7, "name": "Uspallata Mountain Base", "country": "Argentina", "region": "Mendoza", "category": "High Mountain Depot", "lat": -32.5922, "lng": -69.3486, "elevation": 2040, "route": "RN 7 / RP 52", "hazard": "Rockfall / Slope Sinking", "desc": "Strategic staging oasis on RN 7 for trucks awaiting international pass clearance."},
    {"id": 8, "name": "Potrerillos Reservoir Dam", "country": "Argentina", "region": "Mendoza", "category": "Hydraulic / Bridge Node", "lat": -32.9667, "lng": -69.1833, "elevation": 1400, "route": "RN 7", "hazard": "Seismic Activity", "desc": "Major hydroelectric reservoir and mountain highway crossing over Mendoza River."},
    {"id": 9, "name": "Puente del Inca Natural Bridge", "country": "Argentina", "region": "Mendoza", "category": "Geological Lifeline Landmark", "lat": -32.8250, "lng": -69.9111, "elevation": 2720, "route": "RN 7", "hazard": "Landslides / Mineral Erosion", "desc": "Historic natural arch rock formation and supply corridor point on RN 7."},
    {"id": 10, "name": "Punta de Vacas Border Station", "country": "Argentina", "region": "Mendoza", "category": "Border Inspection / Customs", "lat": -32.8519, "lng": -69.7564, "elevation": 2400, "route": "RN 7", "hazard": "Rockfall / Flash Mudslides", "desc": "Argentine national gendarmerie checkpost and historic trans-Andean railway junction."},
    {"id": 11, "name": "Los Andes Inland Port Terminal", "country": "Chile", "region": "Valparaíso", "category": "Customs Dry Port Hub", "lat": -32.8339, "lng": -70.5983, "elevation": 820, "route": "Route 60 / Route 57", "hazard": "Seismic Fault", "desc": "Primary terrestrial customs clearance and cargo holding terminal for Chilean imports."},
    {"id": 12, "name": "San Felipe Valley Hub", "country": "Chile", "region": "Valparaíso", "category": "Aconcagua Valley Logistics", "lat": -32.7508, "lng": -70.7256, "elevation": 650, "route": "Route 60", "hazard": "Low", "desc": "Agricultural and supply distribution center of the upper Aconcagua river basin."},
    {"id": 13, "name": "Guardia Vieja Checkpoint", "country": "Chile", "region": "Valparaíso", "category": "Chain Control / Inspection", "lat": -32.9056, "lng": -70.3667, "elevation": 1600, "route": "Route 60", "hazard": "Black Ice / Heavy Slush", "desc": "Mandatory winter chain inspection post on Route 60 ascending to Los Caracoles."},
    {"id": 14, "name": "Los Caracoles Switchback Pass", "country": "Chile", "region": "Valparaíso", "category": "Extreme Grade Highway Section", "lat": -32.8500, "lng": -70.1500, "elevation": 3100, "route": "Route 60", "hazard": "Steep 29 Hairpin Curves / Ice", "desc": "World-famous 29 continuous hairpin curves climbing 1,500m up the Andean wall."},
    {"id": 15, "name": "Aconcagua Provincial Park Gate", "country": "Argentina", "region": "Mendoza", "category": "High Mountain Reserve Portal", "lat": -32.8139, "lng": -69.9408, "elevation": 2950, "route": "RN 7", "hazard": "Extreme Cold (-30°C) / High Altitude Winds", "desc": "Base entrance to Mount Aconcagua (6,961m), the highest peak in the Western Hemisphere."},
    {"id": 16, "name": "Polvaredas Highway Maintenance Base", "country": "Argentina", "region": "Mendoza", "category": "Vialidad Road Station", "lat": -32.7833, "lng": -69.6167, "elevation": 2250, "route": "RN 7", "hazard": "Severe Rockfalls", "desc": "Strategic snowplow and heavy road machinery depot operated by Argentine Highway Dept."},
    {"id": 17, "name": "Cacheuta Thermal Tunnel", "country": "Argentina", "region": "Mendoza", "category": "Mountain Tunnel Link", "lat": -33.0167, "lng": -69.1167, "elevation": 1250, "route": "RP 82", "hazard": "Rockfall Hazard", "desc": "Scenic mountain tunnel linking the pre-cordillera to the city of Mendoza."},
    {"id": 18, "name": "Las Cuevas Frontier Outpost", "country": "Argentina", "region": "Mendoza", "category": "High Frontier Settlement", "lat": -32.8167, "lng": -70.0500, "elevation": 3150, "route": "RN 7", "hazard": "Extreme Snow / Sub-Zero", "desc": "Final Argentine settlement before the international border tunnel at 3,200m altitude."},
    {"id": 19, "name": "Farellones Mountain Base", "country": "Chile", "region": "Región Metropolitana", "category": "Alpine Road Tri-Junction", "lat": -33.3556, "lng": -70.3139, "elevation": 2340, "route": "Route G-21 (Camino a Farellones)", "hazard": "40 Switchback Curves / Landslides", "desc": "Historic mountain village commanding access to three premier high-altitude ski valleys."},
    {"id": 20, "name": "Valle Nevado Logistics Depot", "country": "Chile", "region": "Región Metropolitana", "category": "High Alpine Logistics", "lat": -33.3536, "lng": -70.2489, "elevation": 3025, "route": "Route G-21", "hazard": "Heavy Mountain Blizzards", "desc": "South America's largest ski complex and high-altitude emergency helipad."},
    {"id": 21, "name": "El Colorado Meteorological Station", "country": "Chile", "region": "Región Metropolitana", "category": "Weather Radar & Ski Node", "lat": -33.3489, "lng": -70.2917, "elevation": 2500, "route": "Route G-21", "hazard": "Freezing Fog / Gale Winds", "desc": "Andean weather observatory and critical mountain communication mast."},
    {"id": 22, "name": "La Parva High Lookout", "country": "Chile", "region": "Región Metropolitana", "category": "High Mountain Ridge Base", "lat": -33.3333, "lng": -70.2833, "elevation": 2750, "route": "Route G-21", "hazard": "Avalanche Chutes", "desc": "Northern ski base overlooking the Santiago urban basin from high Andean ridges."},
    {"id": 23, "name": "San José de Maipo Civil Center", "country": "Chile", "region": "Región Metropolitana", "category": "Valley Administration / Depot", "lat": -33.6417, "lng": -70.3500, "elevation": 970, "route": "Route G-25 (Camino Al Volcán)", "hazard": "River Swell / Flash Debris Flow", "desc": "Communal capital of Cajón del Maipo valley coordinating water and energy logistics."},
    {"id": 24, "name": "El Volcán Geological Node", "country": "Chile", "region": "Región Metropolitana", "category": "Mining & Glacial Access Base", "lat": -33.8167, "lng": -70.1667, "elevation": 1400, "route": "Route G-25", "hazard": "Rockfalls / Mudflow Corridors", "desc": "Upper valley gateway towards San José Volcano and high-altitude copper deposits."},
    {"id": 25, "name": "Baños Morales Rescue Station", "country": "Chile", "region": "Región Metropolitana", "category": "Natural Monument & Rescue", "lat": -33.7719, "lng": -70.0606, "elevation": 1850, "route": "Route G-25", "hazard": "Glacial Flash Flooding", "desc": "Alpine rescue center and thermal spring staging base near El Morado Glacier."},
    {"id": 26, "name": "Embalse El Yeso Reservoir Dam", "country": "Chile", "region": "Región Metropolitana", "category": "Strategic Water Supply Asset", "lat": -33.6767, "lng": -70.0889, "elevation": 2500, "route": "Route G-455", "hazard": "Severe Cliff Sinking / Rockfall", "desc": "250-million-cubic-meter turquoise alpine reservoir providing drinking water to 7 million residents."},
    {"id": 27, "name": "Rancagua Agro-Industrial Hub", "country": "Chile", "region": "O'Higgins", "category": "Regional Logistics Center", "lat": -34.1708, "lng": -70.7444, "elevation": 570, "route": "Route 5 South / Carretera del Cobre", "hazard": "Seismic", "desc": "Capital of O'Higgins region; junction for the world's largest underground copper complex."},
    {"id": 28, "name": "Sewell Mining Heritage Site", "country": "Chile", "region": "O'Higgins", "category": "UNESCO Industrial Settlement", "lat": -34.0906, "lng": -70.3806, "elevation": 2140, "route": "Carretera del Cobre", "hazard": "Extreme Slope Exposure", "desc": "Historic 'City of Stairs' mountain mining city built on steep Andean cliffs."},
    {"id": 29, "name": "El Teniente Mine Complex", "country": "Chile", "region": "O'Higgins", "category": "Mining Extraction Giant", "lat": -34.0833, "lng": -70.4500, "elevation": 2200, "route": "Carretera del Cobre", "hazard": "Heavy Industrial Truck Traffic", "desc": "World's largest underground copper mine with over 3,000 km of subterranean tunnels."},
    {"id": 30, "name": "Coya Hydroelectric Substation", "country": "Chile", "region": "O'Higgins", "category": "Energy Infrastructure Hub", "lat": -34.2000, "lng": -70.5333, "elevation": 850, "route": "Route H-25", "hazard": "River Overwash", "desc": "Centenary hydroelectric generation plant harnessing the turbulent Cachapoal River."},
    {"id": 31, "name": "Machalí Pre-Cordillera Terminal", "country": "Chile", "region": "O'Higgins", "category": "Inter-Valley Staging Depot", "lat": -34.1833, "lng": -70.6500, "elevation": 600, "route": "Carretera del Cobre", "hazard": "Low", "desc": "Fast-growing logistics and residential terminal at the foot of the Andes mountain range."},
    {"id": 32, "name": "Termas de Cauquenes Thermal Post", "country": "Chile", "region": "O'Higgins", "category": "Historical Thermal Oasis", "lat": -34.2444, "lng": -70.5611, "elevation": 760, "route": "Route H-265", "hazard": "Slope Instability", "desc": "Oldest thermal spa in Chile situated deep within the Cachapoal river canyon."},
    {"id": 33, "name": "Rengo Central Valley Depot", "country": "Chile", "region": "O'Higgins", "category": "Agricultural Lifeline Station", "lat": -34.4083, "lng": -70.8583, "elevation": 320, "route": "Route 5 South", "hazard": "Low", "desc": "Vital food supply and fruit processing node along the Pan-American Highway."},
    {"id": 34, "name": "San Fernando Trans-Andean Depot", "country": "Chile", "region": "O'Higgins", "category": "Tinguiririca Valley Hub", "lat": -34.5833, "lng": -70.9889, "elevation": 340, "route": "Route 5 / Route I-45", "hazard": "Low", "desc": "Strategic branching point towards coastal Pichilemu and eastern Andean thermal routes."},
    {"id": 35, "name": "Termas del Flaco Mountain Post", "country": "Chile", "region": "O'Higgins", "category": "Paleontological & Thermal Base", "lat": -34.9611, "lng": -70.2611, "elevation": 1750, "route": "Route I-45", "hazard": "Winter Road Cutoff / Flash Floods", "desc": "Deep Andean valley known for dinosaur footprints and seasonal hot mineral springs."},
    {"id": 36, "name": "Paso Vergara (Paso del Planchón)", "country": "Chile / Argentina", "region": "Border Pass", "category": "Secondary International Pass", "lat": -35.2167, "lng": -70.5167, "elevation": 2400, "route": "Route J-55 (CL) / RP 226 (AR)", "hazard": "Gravel Mountain Tracks / Winter Snow", "desc": "Seasonal trans-Andean route beneath the active Peteroa Volcano."},
    {"id": 37, "name": "Curicó Fruit & Wine Logistics Hub", "country": "Chile", "region": "Maule", "category": "Agro-Export Rail & Road Depot", "lat": -34.9833, "lng": -71.2333, "elevation": 230, "route": "Route 5 South", "hazard": "Low", "desc": "Major agri-logistics export center for cherries, apples, and central valley wines."},
    {"id": 38, "name": "Romeral Pre-Cordillera Gateway", "country": "Chile", "region": "Maule", "category": "Fruit Packaging & Mountain Base", "lat": -34.9667, "lng": -71.1333, "elevation": 280, "route": "Route J-55", "hazard": "Low", "desc": "Chile's cherry capital and direct highway access to the Teno river gorge."},
    {"id": 39, "name": "Los Queñes River Confluence Base", "country": "Chile", "region": "Maule", "category": "Ecotourism & River Monitoring", "lat": -35.0083, "lng": -70.8167, "elevation": 620, "route": "Route J-55", "hazard": "Seasonal River Floods", "desc": "Picturesque confluence of the Teno and Claro rivers used for hydrological monitoring."},
    {"id": 40, "name": "Talca Regional Capital Command", "country": "Chile", "region": "Maule", "category": "Regional Administrative Hub", "lat": -35.4264, "lng": -71.6554, "elevation": 100, "route": "Route 5 South / Route CH-115", "hazard": "Seismic", "desc": "Regional capital of Maule; western origin of the Pehuenche International Corridor."},
    {"id": 41, "name": "San Clemente Pehuenche Base", "country": "Chile", "region": "Maule", "category": "Corridor Staging Town", "lat": -35.5333, "lng": -71.4833, "elevation": 160, "route": "Route CH-115", "hazard": "Low", "desc": "Gateway municipality organizing logistics and safety convoys heading to Argentina via Pehuenche."},
    {"id": 42, "name": "Laguna del Maule Volcanic Caldera", "country": "Chile", "region": "Maule", "category": "Volcanic Observatory & Lake", "lat": -35.9833, "lng": -70.5000, "elevation": 2160, "route": "Route CH-115", "hazard": "Active Volcanic Inflation / Heavy Snow", "desc": "Vast high-altitude volcanic field and natural reservoir monitored 24x7 for seismic unrest."},
    {"id": 43, "name": "Paso Pehuenche All-Weather Pass", "country": "Chile / Argentina", "region": "Border Pass", "category": "Paved International Lifeline", "lat": -35.9892, "lng": -70.4039, "elevation": 2553, "route": "Route CH-115 (CL) / RN 145 (AR)", "hazard": "High Altitude Frost / Wind Gusts", "desc": "Modern paved international pass connecting Chile's Maule Region with Argentina's southern Mendoza."},
    {"id": 44, "name": "Bardas Blancas Highway Junction", "country": "Argentina", "region": "Mendoza", "category": "Strategic Highway Crossroad", "lat": -35.8667, "lng": -69.8000, "elevation": 1420, "route": "RN 40 / RN 145", "hazard": "Arid Desert Winds / Freezing Nights", "desc": "Critical junction connecting the famous RN 40 north-south axis with trans-Andean RN 145."},
    {"id": 45, "name": "Malargüe Southern Andean Logistics City", "country": "Argentina", "region": "Mendoza", "category": "Scientific & Energy Logistics City", "lat": -35.4750, "lng": -69.5833, "elevation": 1400, "route": "RN 40 / RN 144", "hazard": "Snowstorms / Isolated Passes", "desc": "Home to the Pierre Auger Observatory, mining operations, and southern Mendoza fuel storage."},
    {"id": 46, "name": "Las Leñas Premier Ski Valley", "country": "Argentina", "region": "Mendoza", "category": "Premier Mountain Resort Hub", "lat": -35.1500, "lng": -70.0833, "elevation": 2240, "route": "RP 222", "hazard": "Avalanche Danger / Heavy Powder Snow", "desc": "World-famous ski valley with extensive lodging and emergency medical clinic at 2,240m."},
    {"id": 47, "name": "Los Molles Thermal Hamlet", "country": "Argentina", "region": "Mendoza", "category": "Thermal Valley Base", "lat": -35.1667, "lng": -69.9333, "elevation": 1900, "route": "RP 222", "hazard": "Heavy Snow / Freezing Roads", "desc": "Sulphurous hot springs settlement serving as an emergency fallback base for Las Leñas."},
    {"id": 48, "name": "San Rafael Oasis Logistics Terminal", "country": "Argentina", "region": "Mendoza", "category": "Southern Oasis Capital Hub", "lat": -34.6167, "lng": -68.3333, "elevation": 750, "route": "RN 143 / RN 144 / RN 146", "hazard": "Low", "desc": "Second largest city in Mendoza; central hub for southern wine, food security, and hydroelectric networks."},
    {"id": 49, "name": "Cañón del Atuel Hydroelectric Gorge", "country": "Argentina", "region": "Mendoza", "category": "Canyon Hydroelectric Cascade", "lat": -34.8000, "lng": -68.5000, "elevation": 900, "route": "RP 173", "hazard": "Steep Rockfalls / Narrow Canyons", "desc": "Spectacular 45 km canyon housing 4 major hydroelectric dams generating clean Andean power."},
    {"id": 50, "name": "El Nihuil Dam Reservoir Terminal", "country": "Argentina", "region": "Mendoza", "category": "Major Reservoir & Transit Node", "lat": -35.0333, "lng": -68.6833, "elevation": 1150, "route": "RP 180 / RP 173", "hazard": "Seismic Activity", "desc": "Enormous 9,600-hectare lake and dam regulating water for the vast San Rafael agricultural oasis."}
]

def update_sqlite():
    db_path = os.path.join(os.path.dirname(__file__), 'vehicle_data.db')
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    print("Adding Ladakh vehicles to SQLite...")
    for idx, v_type, plate, driver, reg, lat, lng in LADAKH_VEHICLES:
        cur.execute("""
            INSERT INTO vehicles (vehicle_number, vehicle_type, driver_name, region, lat, lng)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(vehicle_number) DO UPDATE SET
                vehicle_type = excluded.vehicle_type,
                driver_name = excluded.driver_name,
                region = excluded.region,
                lat = excluded.lat,
                lng = excluded.lng
        """, (plate, v_type, driver, reg, lat, lng))
        
    conn.commit()
    cur.execute("SELECT count(*), region FROM vehicles GROUP BY region")
    print("SQLite Vehicles by Region:", cur.fetchall())
    conn.close()

def update_excel_vehicles():
    excel_path = os.path.join(os.path.dirname(__file__), 'vehicle_users_data.xlsx')
    df = pd.read_excel(excel_path)
    
    existing_plates = set(df['Number Plate'].astype(str).str.strip().str.upper())
    
    rows = []
    curr_no = len(df) + 1
    for idx, v_type, plate, driver, reg, lat, lng in LADAKH_VEHICLES:
        if plate.strip().upper() not in existing_plates:
            rows.append({
                'No.': curr_no,
                'Vehicle Type': v_type,
                'Number Plate': plate,
                'Registered Person Name': driver,
                'Region': reg
            })
            curr_no += 1
            
    if rows:
        df_new = pd.DataFrame(rows)
        df_combined = pd.concat([df, df_new], ignore_index=True)
        df_combined.to_excel(excel_path, index=False)
        print(f"Added {len(rows)} Ladakh vehicles to vehicle_users_data.xlsx. Total rows: {len(df_combined)}")
    else:
        print("Ladakh vehicles already present in Excel.")

def create_andes_landmarks_files():
    # 1. Excel file
    excel_path = os.path.join(os.path.dirname(__file__), 'south_american_andes_landmarks.xlsx')
    df_andes = pd.DataFrame(ANDES_50_LANDMARKS)
    df_andes.to_excel(excel_path, index=False)
    print(f"Created south_american_andes_landmarks.xlsx with {len(df_andes)} landmarks.")
    
    # 2. JSON file in assets/data
    json_path = os.path.join(os.path.dirname(__file__), '..', 'assets', 'data', 'andes-landmarks.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump({"total": len(ANDES_50_LANDMARKS), "landmarks": ANDES_50_LANDMARKS}, f, indent=2, ensure_ascii=False)
    print(f"Created assets/data/andes-landmarks.json with {len(ANDES_50_LANDMARKS)} landmarks.")

if __name__ == '__main__':
    update_sqlite()
    update_excel_vehicles()
    create_andes_landmarks_files()
