"""
Database initialization and seeding module for GLOBAL-SETU Platform
"""
import os
import sqlite3
import pandas as pd
from werkzeug.security import generate_password_hash

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_DIR = os.path.join(BASE_DIR, 'database')
DB_PATH = os.path.join(DB_DIR, 'global_setu.db')
SCHEMA_PATH = os.path.join(BASE_DIR, 'backend', 'database', 'schema.sql')
DATA_DIR = os.path.join(BASE_DIR, 'data')

def get_db_connection():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    print(f"Initializing database at: {DB_PATH}")
    os.makedirs(DB_DIR, exist_ok=True)
    
    with open(SCHEMA_PATH, 'r') as f:
        schema_sql = f.read()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.executescript(schema_sql)

    # Seed initial users if table is empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        print("Seeding initial users...")
        initial_users = [
            ("Dr. Ananya Sarma", "admin@globalsetu.gov.in", "admin", generate_password_hash("admin123"), "Administrator"),
            ("Rajiv Neog", "logistics@globalsetu.gov.in", "operator", generate_password_hash("operator123"), "Logistics Operator"),
            ("Tenzing Lachenpa", "disaster@globalsetu.gov.in", "officer", generate_password_hash("officer123"), "Disaster Management Officer"),
            ("Bikash Mech", "field@globalsetu.gov.in", "field", generate_password_hash("field123"), "Field Officer"),
            ("Simi Devi", "viewer@globalsetu.gov.in", "viewer", generate_password_hash("viewer123"), "Viewer")
        ]
        cursor.executemany(
            "INSERT INTO users (name, email, username, password_hash, role) VALUES (?, ?, ?, ?, ?)",
            initial_users
        )

    # Seed initial alerts if empty
    cursor.execute("SELECT COUNT(*) FROM alerts")
    if cursor.fetchone()[0] == 0:
        print("Seeding initial alerts...")
        initial_alerts = [
            ("Critical Mudslide on Sonapur Tunnel Bypass", "CRITICAL", "Landslide", "East Khasi Hills, Meghalaya", "NH-06 Shillong-Silchar Mountain Road", "Both lanes blocked by rockfall and heavy silt deposits. Clearance teams deployed."),
            ("Teesta Gorge Road Section Washout", "CRITICAL", "Road Blockage", "29th Mile, West Bengal / Sikkim", "NH-10 Siliguri-Gangtok Teesta Corridor", "40m road section undermined by high water surge. Traffic diverted to NH-717A Lava route."),
            ("Flash Flood Warning on Barak River Basin", "HIGH", "Flood", "Silchar Valley, Assam", "NH-06 and feeder linkages", "River level exceeding warning threshold by 1.2m. Submerged low-lying bridge approaches."),
            ("Debris Flow Warning near Medziphema", "HIGH", "Heavy Rainfall", "Chümoukedima-Kohima sector, Nagaland", "NH-29 Dimapur-Kohima Hill Pass", "Soft soil movement observed on hairpin bend #4. Heavy haulage vehicles halted."),
            ("Subansiri River Pier Scour Alert", "HIGH", "Bridge Risk", "Papum Pare / Sonitpur border", "NH-15 connecting feeder", "Increased hydraulic force detected near bridge foundation pier #3.")
        ]
        cursor.executemany(
            "INSERT INTO alerts (title, severity, category, location, affected_road, description) VALUES (?, ?, ?, ?, ?, ?)",
            initial_alerts
        )

    # Seed initial field reports if empty
    cursor.execute("SELECT COUNT(*) FROM field_reports")
    if cursor.fetchone()[0] == 0:
        print("Seeding initial field reports...")
        initial_reports = [
            ("Sonapur Tunnel, NH-06", "Landslide", "CRITICAL", "Fallen boulder blocks inbound lane; heavy earth-moving equipment required.", None, "Officer B. Mech (Field Unit 3)"),
            ("Dzüdza River Crossing, NH-29", "Road Blockage", "HIGH", "Submerged culvert overflow; light vehicles passing with extreme caution.", None, "Officer T. Jamir (Nagaland PWD)"),
            ("Lava-Reshi Pass, NH-717A", "Flood", "MODERATE", "Minor gravel wash onto roadway; safe for convoy transit at reduced speed.", None, "Capt. P. Dorjee (Logistics Escort)")
        ]
        cursor.executemany(
            "INSERT INTO field_reports (location, issue_type, severity, description, photo_url, reported_by) VALUES (?, ?, ?, ?, ?, ?)",
            initial_reports
        )

    # Seed initial shipments from logistics.csv if empty
    cursor.execute("SELECT COUNT(*) FROM shipments")
    if cursor.fetchone()[0] == 0:
        logistics_csv = os.path.join(DATA_DIR, 'logistics.csv')
        if os.path.exists(logistics_csv):
            print("Seeding initial shipments from logistics.csv...")
            df = pd.read_csv(logistics_csv)
            for _, row in df.iterrows():
                cursor.execute("""
                    INSERT OR REPLACE INTO shipments 
                    (id, vehicle_number, cargo_type, priority, origin, origin_id, destination, destination_id, eta_hours, risk_status, shipment_status, carrier_unit, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row['shipment_id'], row['vehicle_number'], row['cargo_type'], row['priority'],
                    row['origin'], row['origin_id'], row['destination'], row['destination_id'],
                    float(row['eta_hours']), row['risk_status'], row['shipment_status'],
                    row['carrier_unit'], row['notes']
                ))

    conn.commit()
    conn.close()
    print("Database initialization successful!")

if __name__ == '__main__':
    init_db()
