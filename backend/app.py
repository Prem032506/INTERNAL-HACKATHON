from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import pandas as pd

app = Flask(__name__)
CORS(app)

# Create database
def create_database():
    connection = sqlite3.connect("vehicle_data.db")
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_number TEXT UNIQUE,
            vehicle_type TEXT,
            driver_name TEXT,
            region TEXT,
            lat REAL,
            lng REAL
        )
    """)

    # Create deliveries table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            delivery_number TEXT,
            source TEXT,
            destination TEXT,
            vehicle_number TEXT,
            status TEXT
        )
    """)

    connection.commit()
    connection.close()


# Home
@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "message": "Global-Setu SIH AI Backend is Running!",
        "version": "2.0",
        "supported_regions": ["Uttarakhand", "Himachal Pradesh", "Jammu & Kashmir", "Chile", "Argentina", "Odisha"]
    })


# Add vehicle
@app.route("/vehicles", methods=["POST"])
def add_vehicle():
    data = request.get_json()

    vehicle_number = data.get("vehicle_number")
    vehicle_type = data.get("vehicle_type")
    driver_name = data.get("driver_name")
    region = data.get("region", "Global")
    lat = data.get("lat", 0.0)
    lng = data.get("lng", 0.0)

    connection = sqlite3.connect("vehicle_data.db")
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO vehicles (vehicle_number, vehicle_type, driver_name, region, lat, lng)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (vehicle_number, vehicle_type, driver_name, region, lat, lng))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Vehicle added successfully",
        "vehicle_number": vehicle_number
    })


# View vehicles (with optional region filter)
@app.route("/vehicles", methods=["GET"])
def view_vehicles():
    region_param = request.args.get("region", "").strip().lower()

    connection = sqlite3.connect("vehicle_data.db")
    cursor = connection.cursor()

    if region_param and region_param != "all":
        # Region aliases
        if region_param in ["uk", "uttarakhand"]:
            cursor.execute("SELECT id, vehicle_number, vehicle_type, driver_name, region, lat, lng FROM vehicles WHERE LOWER(region) LIKE '%uttarakhand%' OR LOWER(region) LIKE '%uk%'")
        elif region_param in ["hp", "himachal", "himachal pradesh"]:
            cursor.execute("SELECT id, vehicle_number, vehicle_type, driver_name, region, lat, lng FROM vehicles WHERE LOWER(region) LIKE '%himachal%' OR LOWER(region) LIKE '%hp%'")
        elif region_param in ["jk", "kashmir", "jammu", "jammu & kashmir"]:
            cursor.execute("SELECT id, vehicle_number, vehicle_type, driver_name, region, lat, lng FROM vehicles WHERE LOWER(region) LIKE '%kashmir%' OR LOWER(region) LIKE '%jk%'")
        elif region_param in ["ladakh", "la", "ldk"]:
            cursor.execute("SELECT id, vehicle_number, vehicle_type, driver_name, region, lat, lng FROM vehicles WHERE LOWER(region) LIKE '%ladakh%' OR LOWER(region) LIKE '%la%'")
        elif region_param in ["chile", "cl"]:
            cursor.execute("SELECT id, vehicle_number, vehicle_type, driver_name, region, lat, lng FROM vehicles WHERE LOWER(region) LIKE '%chile%' OR LOWER(region) LIKE '%cl%'")
        elif region_param in ["argentina", "ar"]:
            cursor.execute("SELECT id, vehicle_number, vehicle_type, driver_name, region, lat, lng FROM vehicles WHERE LOWER(region) LIKE '%argentina%' OR LOWER(region) LIKE '%ar%'")
        elif region_param in ["odisha", "od", "gunupur"]:
            cursor.execute("SELECT id, vehicle_number, vehicle_type, driver_name, region, lat, lng FROM vehicles WHERE LOWER(region) LIKE '%odisha%' OR LOWER(region) LIKE '%gunupur%'")
        elif region_param in ["himalayan_arc", "himalayas"]:
            cursor.execute("SELECT id, vehicle_number, vehicle_type, driver_name, region, lat, lng FROM vehicles WHERE LOWER(region) IN ('uttarakhand', 'himachal pradesh', 'jammu & kashmir', 'ladakh')")
        elif region_param in ["andes_corridor", "andes"]:
            cursor.execute("SELECT id, vehicle_number, vehicle_type, driver_name, region, lat, lng FROM vehicles WHERE LOWER(region) IN ('chile', 'argentina')")
        else:
            cursor.execute("SELECT id, vehicle_number, vehicle_type, driver_name, region, lat, lng FROM vehicles WHERE LOWER(region) LIKE ?", (f"%{region_param}%",))
    else:
        cursor.execute("SELECT id, vehicle_number, vehicle_type, driver_name, region, lat, lng FROM vehicles")

    vehicles = cursor.fetchall()
    connection.close()

    vehicle_list = []
    for vehicle in vehicles:
        vehicle_list.append({
            "id": vehicle[0],
            "vehicle_number": vehicle[1],
            "vehicle_type": vehicle[2],
            "driver_name": vehicle[3],
            "region": vehicle[4] if len(vehicle) > 4 and vehicle[4] else "Global",
            "lat": vehicle[5] if len(vehicle) > 5 and vehicle[5] is not None else 19.0714,
            "lng": vehicle[6] if len(vehicle) > 6 and vehicle[6] is not None else 83.81488
        })

    return jsonify(vehicle_list)


# Vehicle owner lookup from Excel or SQLite fallback
@app.route("/vehicle-owner", methods=["POST"])
def vehicle_owner():
    data = request.get_json() or {}
    vehicle_number = str(data.get("vehicle_number", "")).strip().upper()

    if not vehicle_number:
        return jsonify({"message": "Please provide a valid vehicle number"}), 400

    # Normalize lookup query
    query_clean = vehicle_number.replace("-", "").replace(" ", "")

    # Try Excel first
    try:
        vehicles_df = pd.read_excel("vehicle_users_data.xlsx")
        
        # Clean plates for comparison
        clean_series = vehicles_df["Number Plate"].astype(str).str.strip().str.upper().str.replace("-", "").str.replace(" ", "")
        result = vehicles_df[clean_series == query_clean]

        if not result.empty:
            vehicle = result.iloc[0]
            region = str(vehicle.get("Region", "Registered Region")) if "Region" in vehicle else "Registered Region"
            return jsonify({
                "vehicle_number": str(vehicle["Number Plate"]),
                "vehicle_type": str(vehicle["Vehicle Type"]),
                "owner_name": str(vehicle["Registered Person Name"]),
                "region": region,
                "status": "Active / Verified in Registry",
                "source": "Excel Master Database"
            })
    except Exception as e:
        print("Excel lookup warning:", e)

    # Fallback to SQLite DB
    try:
        connection = sqlite3.connect("vehicle_data.db")
        cursor = connection.cursor()
        cursor.execute("SELECT vehicle_number, vehicle_type, driver_name, region, lat, lng FROM vehicles")
        all_v = cursor.fetchall()
        connection.close()

        for v in all_v:
            v_num = str(v[0]).strip().upper()
            if v_num.replace("-", "").replace(" ", "") == query_clean:
                return jsonify({
                    "vehicle_number": v[0],
                    "vehicle_type": v[1],
                    "owner_name": v[2],
                    "region": v[3] or "Global",
                    "lat": v[4],
                    "lng": v[5],
                    "status": "Active / Verified in Registry",
                    "source": "SQLite Production Database"
                })
    except Exception as e:
        print("SQLite lookup warning:", e)

    return jsonify({
        "message": f"Vehicle '{vehicle_number}' not found in registry."
    }), 404


# Landmarks & Locations Endpoint
@app.route("/locations", methods=["GET"])
def get_locations():
    region_param = request.args.get("region", "all").strip().lower()
    
    try:
        if region_param in ["andes", "chile", "argentina", "andes_corridor"]:
            df = pd.read_excel("south_american_andes_landmarks.xlsx")
            locations = []
            for _, row in df.iterrows():
                if pd.notna(row.get("name")):
                    locations.append({
                        "id": int(row["id"]) if pd.notna(row.get("id")) else len(locations) + 1,
                        "name": str(row["name"]),
                        "country": str(row.get("country", "")),
                        "region": str(row.get("region", "")),
                        "classification": str(row.get("category", "Andean Landmark")),
                        "lat": float(row["lat"]),
                        "lng": float(row["lng"]),
                        "elevation": int(row["elevation"]) if pd.notna(row.get("elevation")) else 0,
                        "route": str(row.get("route", "")),
                        "hazard": str(row.get("hazard", "")),
                        "significance": str(row.get("desc", ""))
                    })
            return jsonify({
                "region": "South American Andes (50 Landmarks)",
                "total": len(locations),
                "locations": locations
            })
        else:
            df = pd.read_excel("gunupur_location_SIH.xlsx")
            locations = []
            for _, row in df.iterrows():
                if pd.notna(row.get("Landmark Name")):
                    locations.append({
                        "id": int(row["ID"]) if pd.notna(row.get("ID")) else len(locations) + 1,
                        "name": str(row["Landmark Name"]),
                        "classification": str(row.get("Landmark Classification", "Landmark")),
                        "lat": float(row["Latitude"]) if pd.notna(row.get("Latitude")) else 19.0714,
                        "lng": float(row["Longitude"]) if pd.notna(row.get("Longitude")) else 83.8148,
                        "significance": str(row.get("Route & Positional Significance", ""))
                    })
            return jsonify({
                "region": "Gunupur / Odisha",
                "total": len(locations),
                "locations": locations
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Add delivery
@app.route("/deliveries", methods=["POST"])
def add_delivery():
    data = request.get_json()

    delivery_number = data["delivery_number"]
    source = data["source"]
    destination = data["destination"]
    vehicle_number = data["vehicle_number"]
    status = data["status"]

    connection = sqlite3.connect("vehicle_data.db")
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO deliveries
        (delivery_number, source, destination, vehicle_number, status)
        VALUES (?, ?, ?, ?, ?)
    """, (
        delivery_number,
        source,
        destination,
        vehicle_number,
        status
    ))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Delivery added successfully"
    })


# View deliveries
@app.route("/deliveries", methods=["GET"])
def view_deliveries():
    connection = sqlite3.connect("vehicle_data.db")
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM deliveries")
    deliveries = cursor.fetchall()

    connection.close()

    delivery_list = []

    for delivery in deliveries:
        delivery_list.append({
            "id": delivery[0],
            "delivery_number": delivery[1],
            "source": delivery[2],
            "destination": delivery[3],
            "vehicle_number": delivery[4],
            "status": delivery[5]
        })

    return jsonify(delivery_list)


# Update delivery status
@app.route("/deliveries/<int:id>/status", methods=["PUT"])
def update_delivery_status(id):
    data = request.get_json()

    status = data["status"]

    connection = sqlite3.connect("vehicle_data.db")
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE deliveries
        SET status = ?
        WHERE id = ?
    """, (status, id))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Delivery status updated successfully"
    })


# Delete delivery
@app.route("/deliveries/<int:id>", methods=["DELETE"])
def delete_delivery(id):
    connection = sqlite3.connect("vehicle_data.db")
    cursor = connection.cursor()

    cursor.execute("""
        DELETE FROM deliveries
        WHERE id = ?
    """, (id,))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Delivery deleted successfully"
    })


# Route Optimization
@app.route("/optimize-route", methods=["POST"])
def optimize_route():
    data = request.get_json()

    deliveries = data.get("deliveries", [])

    if not deliveries:
        return jsonify({
            "message": "No deliveries provided"
        }), 400

    # Sort deliveries by delivery ID
    optimized_route = sorted(
        deliveries,
        key=lambda x: x.get("delivery_id", 0)
    )

    return jsonify({
        "message": "Route optimized successfully",
        "total_deliveries": len(optimized_route),
        "optimized_route": optimized_route
    })


if __name__ == "__main__":
    create_database()
    app.run(debug=True)