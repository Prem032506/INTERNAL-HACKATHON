-- SQLite Schema for GLOBAL-SETU Platform
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    affected_road TEXT,
    description TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS field_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    reported_by TEXT NOT NULL,
    status TEXT DEFAULT 'VERIFIED_ACTIVE',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    vehicle_number TEXT NOT NULL,
    cargo_type TEXT NOT NULL,
    priority TEXT NOT NULL,
    origin TEXT NOT NULL,
    origin_id TEXT NOT NULL,
    destination TEXT NOT NULL,
    destination_id TEXT NOT NULL,
    eta_hours REAL NOT NULL,
    risk_status TEXT NOT NULL,
    shipment_status TEXT NOT NULL,
    carrier_unit TEXT,
    notes TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS road_simulations (
    road_id TEXT PRIMARY KEY,
    rainfall_added REAL DEFAULT 0,
    current_rainfall REAL,
    risk_score INTEGER,
    risk_level TEXT,
    road_status TEXT,
    is_simulated INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
