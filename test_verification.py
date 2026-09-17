import urllib.request
import json

print("=== 1. Testing Frontend Static Server (Port 8080) ===")
with urllib.request.urlopen("http://127.0.0.1:8080/index.html") as resp:
    content = resp.read().decode("utf-8")
    print(f"-> index.html fetched ({len(content)} bytes, status {resp.status})")
    assert "vehicle-lookup-modal" in content, "Missing vehicle-lookup-modal"
    assert "btn-open-vehicle-lookup" in content, "Missing lookup button"
    assert "ODISHA_GUNUPUR" in content, "Missing ODISHA_GUNUPUR option"
    print("-> Frontend HTML assertions passed!")

print("\n=== 2. Testing Global Regions JSON ===")
with urllib.request.urlopen("http://127.0.0.1:8080/assets/data/global-regions.json") as resp:
    regions_data = json.loads(resp.read().decode("utf-8"))
    region_ids = [r["id"] for r in regions_data["regions"]]
    print("-> Available Regions:", region_ids)

print("\n=== 3. Testing Backend /vehicles Endpoint (Port 5000) ===")
with urllib.request.urlopen("http://127.0.0.1:5000/vehicles") as resp:
    all_v = json.loads(resp.read().decode("utf-8"))
    print(f"-> Total registered vehicles: {len(all_v)}")
    regions_found = set(v.get("region") for v in all_v)
    print("-> Regions in database:", regions_found)

print("\n=== 4. Testing Vehicle Registry Lookup across all 5 user datasets ===")
test_plates = [
    # Argentina (Image 1)
    ("AB 102 AA", "Juan García", "Bike", "Argentina"),
    ("AC 201 AA", "Carlos García", "Car", "Argentina"),
    ("AM 1101 AL", "Martín Torres", "Ambulance", "Argentina"),
    # Chile (Image 2)
    ("AB-CD-21", "Mateo Rojas", "Bike", "Chile"),
    ("EF-GH-31", "Carlos Rojas", "Car", "Chile"),
    ("ST-UV-50", "Roberto González", "Ambulance", "Chile"),
    # Uttarakhand (Image 3)
    ("UK-01-AB-1021", "Rohit Rawat", "Bike", "Uttarakhand"),
    ("UK-02-AC-2011", "Rajesh Rawat", "Car", "Uttarakhand"),
    ("UK-01-AM-1101", "Vijay Thakur", "Ambulance", "Uttarakhand"),
    # Himachal Pradesh (Image 4)
    ("HP-01-A-1021", "Rakesh Thakur", "Bike", "Himachal Pradesh"),
    ("HP-02-B-2011", "Rajesh Thakur", "Car", "Himachal Pradesh"),
    ("HP-11-L-1101", "Arjun Thakur", "Ambulance", "Himachal Pradesh"),
    # Jammu & Kashmir (Image 5)
    ("JK-01-AB-1021", "Aamir Dar", "Bike", "Jammu & Kashmir"),
    ("JK-02-AC-2011", "Zahoor Ahmad", "Car", "Jammu & Kashmir"),
    ("JK-01-AM-1101", "Junaid Hussain", "Ambulance", "Jammu & Kashmir"),
    # Ladakh (New Image 1)
    ("LA-01-AB-1021", "Tashi Dorjay", "Bike", "Ladakh"),
    ("LA-01-AC-2011", "Tashi Namgyal", "Car", "Ladakh"),
    ("LA-01-AM-1101", "Sonam Namgyal", "Ambulance", "Ladakh"),
    # Odisha
    ("OD 18 AB 1021", "Rakesh Sahu", "Bike", "Odisha")
]

passed = 0
for plate, exp_name, exp_type, exp_reg in test_plates:
    req = urllib.request.Request(
        "http://127.0.0.1:5000/vehicle-owner",
        data=json.dumps({"vehicle_number": plate}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        match_name = exp_name.lower() in res.get("owner_name", "").lower()
        match_type = exp_type.lower() in res.get("vehicle_type", "").lower()
        status = "PASS" if (match_name and match_type) else "FAIL"
        if match_name and match_type:
            passed += 1
        print(f"[{status}] {plate} -> Owner: {res.get('owner_name')} | Type: {res.get('vehicle_type')} | Region: {res.get('region')}")

print(f"\n-> Lookup Summary: {passed}/{len(test_plates)} verified successfully!")

print("\n=== 5. Testing Gunupur Landmarks Endpoint ===")
with urllib.request.urlopen("http://127.0.0.1:5000/locations?region=gunupur") as resp:
    loc_res = json.loads(resp.read().decode("utf-8"))
    print(f"-> Loaded {loc_res.get('total')} landmarks from Gunupur Excel dataset.")
    print(f"-> Sample Landmark: {loc_res['locations'][0]['name']} at [{loc_res['locations'][0]['lat']}, {loc_res['locations'][0]['lng']}]")

print("\n=== 6. Testing South American Andes 50 Landmarks Endpoint ===")
with urllib.request.urlopen("http://127.0.0.1:5000/locations?region=andes") as resp:
    andes_res = json.loads(resp.read().decode("utf-8"))
    print(f"-> Loaded {andes_res.get('total')} landmarks from Andes 50 dataset.")
    print(f"-> Sample Andes Landmark: {andes_res['locations'][0]['name']} ({andes_res['locations'][0]['country']}) - Elevation: {andes_res['locations'][0]['elevation']}m")
    assert andes_res.get('total') == 50, f"Expected 50 landmarks, got {andes_res.get('total')}"
    print("-> Andes 50 Landmarks verified!")
