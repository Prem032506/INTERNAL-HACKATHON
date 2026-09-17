class FleetTelemetryManager {
  constructor() {
    this.allVehicles = [];
    this.vehicles = [];
    this.activeRegion = "ALL";
    this.subscribers = [];
    this.timer = null;
  }

  async initialize() {
    try {
      // Get vehicle data from Flask backend
      const response = await fetch("http://127.0.0.1:5000/vehicles");

      if (!response.ok) {
        throw new Error("Backend connection failed");
      }

      const backendVehicles = await response.json();

      this.allVehicles = backendVehicles.map((vehicle, index) => {
        return this.formatVehicleRecord(vehicle, index);
      });

      console.log(`Loaded ${this.allVehicles.length} vehicles from backend.`);
    } catch (error) {
      console.warn("Could not connect to backend, loading comprehensive client-side vehicle fleet:", error);
      this.allVehicles = this.getStaticFallbackVehicles();
    }

    this.filterByRegion(window.mapEngine?.currentRegionId || "ALL");
    this.startLiveSimulation();
  }

  formatVehicleRecord(vehicle, index = 0) {
    const vType = vehicle.vehicle_type || "Truck";
    let cargo = "Essential Commodities";
    let tempCelsius = undefined;

    if (vType === "Ambulance") {
      cargo = "Emergency Life Support / ICU Transfer";
    } else if (vType === "Truck") {
      cargo = "WFP Food Grains & Relief Cargo";
    } else if (vType === "Mini Truck") {
      cargo = "Cold-Chain Medical Supplies";
      tempCelsius = 4.2;
    } else if (vType === "Pickup Truck" || vType === "Van") {
      cargo = "Disaster Shelter & Emergency Kits";
    } else if (vType === "Bike") {
      cargo = "Rapid Medical Dispatch / First Aid";
    } else if (vType === "Auto Rickshaw" || vType === "Taxi") {
      cargo = "Essential Community Logistics";
    } else if (vType === "Bus") {
      cargo = "Civilian Evacuation Transit";
    } else if (vType === "SUV" || vType === "Jeep") {
      cargo = "Mountain Rescue & Inspection Team";
    }

    return {
      id: vehicle.vehicle_number,
      name: vehicle.driver_name,
      category: vType,
      region: vehicle.region || "Global",
      cargo: cargo,
      lat: Number(vehicle.lat) || (19.0714 + (index * 0.001)),
      lng: Number(vehicle.lng) || (83.81488 + (index * 0.001)),
      baseLat: Number(vehicle.lat) || 19.0714,
      baseLng: Number(vehicle.lng) || 83.81488,
      speedKmH: Math.floor(Math.random() * 25) + 35,
      eta: "Active (On Schedule)",
      tempCelsius: tempCelsius,
      sos: false,
      sosReason: null
    };
  }

  filterByRegion(regionId) {
    this.activeRegion = regionId;

    if (!regionId || regionId === "ALL") {
      this.vehicles = [...this.allVehicles];
    } else if (regionId === "HIMALAYAN_ARC") {
      this.vehicles = this.allVehicles.filter(v =>
        v.region === "Uttarakhand" ||
        v.region === "Himachal Pradesh" ||
        v.region === "Jammu & Kashmir" ||
        v.region === "Ladakh" ||
        v.id.startsWith("UK") ||
        v.id.startsWith("HP") ||
        v.id.startsWith("JK") ||
        v.id.startsWith("LA")
      );
    } else if (regionId === "ANDES_CORRIDOR") {
      this.vehicles = this.allVehicles.filter(v =>
        v.region === "Chile" ||
        v.region === "Argentina" ||
        v.id.includes("-") ||
        v.id.startsWith("AB ") ||
        v.id.startsWith("AC ") ||
        v.id.startsWith("AD ") ||
        v.id.startsWith("AE ") ||
        v.id.startsWith("AF ") ||
        v.id.startsWith("AG ") ||
        v.id.startsWith("AH ") ||
        v.id.startsWith("AJ ") ||
        v.id.startsWith("AK ") ||
        v.id.startsWith("AL ") ||
        v.id.startsWith("AM ")
      );
    } else if (regionId === "ODISHA_GUNUPUR") {
      this.vehicles = this.allVehicles.filter(v =>
        v.region === "Odisha" || v.id.startsWith("OD")
      );
    } else {
      // Default to all or regional
      this.vehicles = this.allVehicles.filter(v =>
        v.region.toLowerCase().includes(regionId.toLowerCase())
      );
      if (this.vehicles.length === 0) {
        this.vehicles = [...this.allVehicles];
      }
    }

    this.updateFleetPanel();
    this.notifySubscribers();
  }

  startLiveSimulation() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      this.allVehicles.forEach(vehicle => {
        // Subtle realistic GPS drift around base coords
        const jitterLat = (Math.random() - 0.5) * 0.001;
        const jitterLng = (Math.random() - 0.5) * 0.001;

        vehicle.lat += jitterLat;
        vehicle.lng += jitterLng;

        // Dynamic speed variation
        vehicle.speedKmH = Math.max(
          18,
          Math.min(65, Math.round(vehicle.speedKmH + (Math.random() * 4 - 2)))
        );
      });

      this.updateFleetPanel();
      this.notifySubscribers();
    }, 3500);
  }

  updateFleetPanel() {
    const fleetFeed = document.getElementById("fleet-telemetry-feed");
    if (!fleetFeed) return;

    if (this.vehicles.length === 0) {
      fleetFeed.innerHTML = `
        <div class="telemetry-card">
          <div class="truck-header">
            <span class="truck-id">No Vehicles</span>
            <span class="cargo-tag">${this.activeRegion}</span>
          </div>
          <div class="truck-route">
            No active fleet units in this sector.
          </div>
          <div class="truck-meta">
            <span>Status: <strong>Standby</strong></span>
          </div>
        </div>
      `;
      return;
    }

    // Render top active vehicles for current sector (up to 15 cards for performance)
    fleetFeed.innerHTML = "";
    const displayVehicles = this.vehicles.slice(0, 15);

    displayVehicles.forEach(vehicle => {
      const card = document.createElement("div");
      card.className = `telemetry-card ${vehicle.sos ? 'sos-card' : ''}`;
      if (vehicle.sos) {
        card.style.borderColor = "rgba(239, 68, 68, 0.4)";
        card.style.background = "rgba(239, 68, 68, 0.08)";
      }

      const iconEmoji = this.getVehicleIcon(vehicle.category);

      card.innerHTML = `
        <div class="truck-header">
          <span class="truck-id">${iconEmoji} ${vehicle.id}</span>
          <span class="cargo-tag">${vehicle.category}</span>
        </div>

        <div class="truck-route">
          <strong>Driver:</strong> ${vehicle.name} <br>
          <span style="font-size:0.72rem;color:var(--neon-cyan);">📍 ${vehicle.region}</span>
        </div>

        <div class="truck-meta">
          <span>Speed: <strong>${vehicle.speedKmH} km/h</strong></span>
          <span>Status: <strong style="color:var(--neon-emerald);">${vehicle.eta}</strong></span>
        </div>

        ${vehicle.tempCelsius !== undefined ? `
          <div style="font-size:0.72rem;color:#67e8f9;margin-top:4px;">
            ❄️ Cold-Chain: <strong>${vehicle.tempCelsius}°C (Nominal)</strong>
          </div>
        ` : ''}

        ${vehicle.sos ? `
          <div style="margin-top:5px;font-size:0.72rem;color:#fca5a5;">
            ⚠️ <strong>SOS ALERT:</strong> ${vehicle.sosReason}
          </div>
        ` : ''}
      `;

      card.addEventListener("click", () => {
        if (window.mapEngine) {
          window.mapEngine.flyToLocation(vehicle.lat, vehicle.lng, 12);
        }
      });

      fleetFeed.appendChild(card);
    });

    if (this.vehicles.length > 15) {
      const moreNote = document.createElement("div");
      moreNote.style.cssText = "text-align:center;padding:8px;font-size:0.75rem;color:var(--text-secondary);";
      moreNote.innerHTML = `+ ${this.vehicles.length - 15} more registered vehicles tracking in this sector`;
      fleetFeed.appendChild(moreNote);
    }
  }

  getVehicleIcon(category) {
    switch (category) {
      case 'Bike': return '🏍️';
      case 'Car': return '🚗';
      case 'SUV': return '🚙';
      case 'Jeep': return '🚙';
      case 'Van': return '🚐';
      case 'Pickup Truck': return '🛻';
      case 'Mini Truck': return '🚚';
      case 'Truck': return '🚛';
      case 'Auto Rickshaw': return '🛺';
      case 'Taxi': return '🚕';
      case 'Bus': return '🚌';
      case 'Ambulance': return '🚑';
      default: return '🚚';
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.vehicles);
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.vehicles));
  }

  getVehicleById(id) {
    const clean = id.trim().toUpperCase().replace(/[- ]/g, '');
    return this.allVehicles.find(v => v.id.trim().toUpperCase().replace(/[- ]/g, '') === clean);
  }

  triggerSOS(vehicleId, reason) {
    const vehicle = this.getVehicleById(vehicleId) || this.vehicles[0];
    if (vehicle) {
      vehicle.sos = true;
      vehicle.sosReason = reason || "EMERGENCY: Mountain route disruption ahead";
      this.updateFleetPanel();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  resolveSOS(vehicleId) {
    const vehicle = this.getVehicleById(vehicleId);
    if (vehicle) {
      vehicle.sos = false;
      vehicle.sosReason = null;
      this.updateFleetPanel();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  getStaticFallbackVehicles() {
    // 150 vehicles from 5 regions + Gunupur
    const base = [
      // Uttarakhand (UK)
      { id: "UK-01-AB-1021", name: "Rohit Rawat", category: "Bike", region: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
      { id: "UK-01-AB-1022", name: "Amit Negi", category: "Bike", region: "Uttarakhand", lat: 30.3250, lng: 78.0410 },
      { id: "UK-02-AC-2011", name: "Rajesh Rawat", category: "Car", region: "Uttarakhand", lat: 30.0869, lng: 78.2676 },
      { id: "UK-03-AD-3011", name: "Mahesh Rawat", category: "SUV", region: "Uttarakhand", lat: 30.1450, lng: 78.5980 },
      { id: "UK-04-AE-4011", name: "Ramesh Bisht", category: "Jeep", region: "Uttarakhand", lat: 30.5500, lng: 79.5600 },
      { id: "UK-05-AF-5011", name: "Yogesh Thakur", category: "Van", region: "Uttarakhand", lat: 29.3803, lng: 79.4636 },
      { id: "UK-06-AG-6011", name: "Bhupendra Rawat", category: "Pickup Truck", region: "Uttarakhand", lat: 30.4000, lng: 79.3300 },
      { id: "UK-07-AH-7011", name: "Kuldeep Negi", category: "Mini Truck", region: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
      { id: "UK-08-AJ-8011", name: "Mahendra Rana", category: "Truck", region: "Uttarakhand", lat: 30.7433, lng: 79.4938 },
      { id: "UK-01-AK-9011", name: "Sanjeev Rawat", category: "Auto Rickshaw", region: "Uttarakhand", lat: 30.3150, lng: 78.0300 },
      { id: "UK-02-AL-1001", name: "Om Prakash Negi", category: "Bus", region: "Uttarakhand", lat: 30.3180, lng: 78.0350 },
      { id: "UK-01-AM-1101", name: "Vijay Thakur", category: "Ambulance", region: "Uttarakhand", lat: 30.3140, lng: 78.0280 },

      // Himachal Pradesh (HP)
      { id: "HP-01-A-1021", name: "Rakesh Thakur", category: "Bike", region: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
      { id: "HP-01-A-1022", name: "Vikram Sharma", category: "Bike", region: "Himachal Pradesh", lat: 31.1120, lng: 77.1810 },
      { id: "HP-02-B-2011", name: "Rajesh Thakur", category: "Car", region: "Himachal Pradesh", lat: 32.2396, lng: 77.1887 },
      { id: "HP-03-C-3011", name: "Harish Thakur", category: "SUV", region: "Himachal Pradesh", lat: 31.9579, lng: 77.1095 },
      { id: "HP-04-D-4011", name: "Devendra Negi", category: "Jeep", region: "Himachal Pradesh", lat: 32.3600, lng: 77.1400 },
      { id: "HP-05-E-5011", name: "Prakash Rana", category: "Van", region: "Himachal Pradesh", lat: 32.2190, lng: 76.3234 },
      { id: "HP-06-F-6011", name: "Mahendra Thakur", category: "Pickup Truck", region: "Himachal Pradesh", lat: 32.5700, lng: 77.0300 },
      { id: "HP-07-G-7011", name: "Kuldeep Sharma", category: "Mini Truck", region: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
      { id: "HP-08-H-8011", name: "Raj Kumar Thakur", category: "Truck", region: "Himachal Pradesh", lat: 32.9000, lng: 77.5800 },
      { id: "HP-09-J-9011", name: "Sanjeev Chauhan", category: "Auto Rickshaw", region: "Himachal Pradesh", lat: 31.1030, lng: 77.1710 },
      { id: "HP-10-K-1001", name: "Om Prakash Negi", category: "Bus", region: "Himachal Pradesh", lat: 31.1060, lng: 77.1750 },
      { id: "HP-11-L-1101", name: "Arjun Thakur", category: "Ambulance", region: "Himachal Pradesh", lat: 31.1040, lng: 77.1720 },

      // Jammu & Kashmir (JK)
      { id: "JK-01-AB-1021", name: "Aamir Dar", category: "Bike", region: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973 },
      { id: "JK-01-AB-1022", name: "Adil Khan", category: "Bike", region: "Jammu & Kashmir", lat: 34.0910, lng: 74.8050 },
      { id: "JK-02-AC-2011", name: "Zahoor Ahmad", category: "Car", region: "Jammu & Kashmir", lat: 32.7266, lng: 74.8570 },
      { id: "JK-04-AD-3011", name: "Abdul Rashid", category: "SUV", region: "Jammu & Kashmir", lat: 33.7311, lng: 75.1487 },
      { id: "JK-05-AE-4011", name: "Showkat Hussain", category: "Jeep", region: "Jammu & Kashmir", lat: 34.2800, lng: 75.1500 },
      { id: "JK-01-AF-5011", name: "Ghulam Nabi", category: "Van", region: "Jammu & Kashmir", lat: 34.2090, lng: 74.3436 },
      { id: "JK-02-AG-6011", name: "Bashir Ahmad", category: "Pickup Truck", region: "Jammu & Kashmir", lat: 33.2500, lng: 75.2500 },
      { id: "JK-03-AH-7011", name: "Nazir Hussain", category: "Mini Truck", region: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973 },
      { id: "JK-04-AJ-8011", name: "Mohammad Yousuf", category: "Truck", region: "Jammu & Kashmir", lat: 34.5500, lng: 76.1300 },
      { id: "JK-01-AK-9011", name: "Rashid Ahmad", category: "Auto Rickshaw", region: "Jammu & Kashmir", lat: 34.0820, lng: 74.7950 },
      { id: "JK-02-AL-1001", name: "Manzoor Ahmad", category: "Bus", region: "Jammu & Kashmir", lat: 34.0850, lng: 74.8000 },
      { id: "JK-01-AM-1101", name: "Junaid Hussain", category: "Ambulance", region: "Jammu & Kashmir", lat: 34.0840, lng: 74.7960 },

      // Ladakh (LA)
      { id: "LA-01-AB-1021", name: "Tashi Dorjay", category: "Bike", region: "Ladakh", lat: 34.1526, lng: 77.5771 },
      { id: "LA-01-AB-1022", name: "Stanzin Angmo", category: "Bike", region: "Ladakh", lat: 34.1610, lng: 77.5850 },
      { id: "LA-01-AC-2011", name: "Tashi Namgyal", category: "Car", region: "Ladakh", lat: 34.1526, lng: 77.5771 },
      { id: "LA-01-AD-3011", name: "Tsering Angmo", category: "SUV", region: "Ladakh", lat: 34.5500, lng: 76.1300 },
      { id: "LA-01-AE-4011", name: "Namgyal Dorje", category: "Jeep", region: "Ladakh", lat: 34.2800, lng: 77.6000 },
      { id: "LA-01-AF-5011", name: "Tashi Phuntsok", category: "Van", region: "Ladakh", lat: 34.5800, lng: 77.5000 },
      { id: "LA-01-AG-6011", name: "Tsewang Norbu", category: "Pickup Truck", region: "Ladakh", lat: 34.4200, lng: 76.8000 },
      { id: "LA-01-AH-7011", name: "Karma Tsering", category: "Mini Truck", region: "Ladakh", lat: 34.1526, lng: 77.5771 },
      { id: "LA-01-AJ-8011", name: "Stanzin Norbu", category: "Truck", region: "Ladakh", lat: 34.2800, lng: 75.1500 },
      { id: "LA-01-AK-9011", name: "Pema Dorje", category: "Auto Rickshaw", region: "Ladakh", lat: 34.1510, lng: 77.5750 },
      { id: "LA-01-AL-1001", name: "Rigzin Wangchuk", category: "Bus", region: "Ladakh", lat: 34.1530, lng: 77.5790 },
      { id: "LA-01-AM-1101", name: "Sonam Namgyal", category: "Ambulance", region: "Ladakh", lat: 34.1520, lng: 77.5760 },

      // Chile (CL)
      { id: "AB-CD-21", name: "Mateo Rojas", category: "Bike", region: "Chile", lat: -33.4489, lng: -70.6693 },
      { id: "EF-GH-31", name: "Carlos Rojas", category: "Car", region: "Chile", lat: -33.4489, lng: -70.6693 },
      { id: "IJ-KL-40", name: "Alejandro González", category: "SUV", region: "Chile", lat: -33.4470, lng: -70.6660 },
      { id: "MN-OP-42", name: "Manuel Morales", category: "Jeep", region: "Chile", lat: -32.8300, lng: -70.1000 },
      { id: "QR-ST-43", name: "Gonzalo Soto", category: "Van", region: "Chile", lat: -33.4460, lng: -70.6680 },
      { id: "UV-WX-44", name: "Héctor Vargas", category: "Pickup Truck", region: "Chile", lat: -32.9000, lng: -70.3000 },
      { id: "YZ-AB-45", name: "Patricio Torres", category: "Mini Truck", region: "Chile", lat: -33.4430, lng: -70.6620 },
      { id: "GH-IJ-47", name: "Juan Muñoz", category: "Truck", region: "Chile", lat: -32.8200, lng: -70.0700 },
      { id: "KL-MN-48", name: "Oscar Pérez", category: "Taxi", region: "Chile", lat: -33.4480, lng: -70.6670 },
      { id: "OP-QR-49", name: "Claudio Silva", category: "Bus", region: "Chile", lat: -33.4490, lng: -70.6710 },
      { id: "ST-UV-50", name: "Roberto González", category: "Ambulance", region: "Chile", lat: -33.4440, lng: -70.6650 },

      // Argentina (AR)
      { id: "AB 102 AA", name: "Juan García", category: "Bike", region: "Argentina", lat: -32.8895, lng: -68.8458 },
      { id: "AC 201 AA", name: "Carlos García", category: "Car", region: "Argentina", lat: -32.8895, lng: -68.8458 },
      { id: "AD 301 AA", name: "Ricardo Torres", category: "SUV", region: "Argentina", lat: -32.8800, lng: -68.8500 },
      { id: "AE 401 AC", name: "Esteban López", category: "Jeep", region: "Argentina", lat: -32.8200, lng: -69.3500 },
      { id: "AF 501 AD", name: "Gustavo Fernández", category: "Van", region: "Argentina", lat: -32.8850, lng: -68.8450 },
      { id: "AG 601 AE", name: "Hernán Rodríguez", category: "Pickup Truck", region: "Argentina", lat: -32.8500, lng: -69.2000 },
      { id: "AH 701 AF", name: "Sergio González", category: "Mini Truck", region: "Argentina", lat: -32.8890, lng: -68.8410 },
      { id: "AJ 801 AH", name: "Oscar Sánchez", category: "Truck", region: "Argentina", lat: -32.8250, lng: -69.7500 },
      { id: "AK 901 AJ", name: "Daniel Romero", category: "Taxi", region: "Argentina", lat: -32.8900, lng: -68.8460 },
      { id: "AL 1001 AK", name: "Claudio Díaz", category: "Bus", region: "Argentina", lat: -32.8880, lng: -68.8420 },
      { id: "AM 1101 AL", name: "Martín Torres", category: "Ambulance", region: "Argentina", lat: -32.8860, lng: -68.8500 },

      // Odisha (Gunupur)
      { id: "OD 18 AB 1021", name: "Rakesh Sahu", category: "Bike", region: "Odisha", lat: 19.0714, lng: 83.81488 },
      { id: "OD 18 AC 2011", name: "Ramesh Sahu", category: "Car", region: "Odisha", lat: 19.06926, lng: 83.81228 },
      { id: "OD 18 AE 4011", name: "Dhiren Behera", category: "Pickup Truck", region: "Odisha", lat: 19.0473, lng: 83.8311 },
      { id: "OD 18 AF 5011", name: "Raju Sahu", category: "Mini Truck", region: "Odisha", lat: 19.0717, lng: 83.80931 },
      { id: "OD 18 AG 6011", name: "Mahendra Sahu", category: "Truck", region: "Odisha", lat: 19.0664, lng: 83.8258 },
      { id: "OD 18 AM 1101", name: "Sunil Sahu", category: "Ambulance", region: "Odisha", lat: 19.0712, lng: 83.8101 }
    ];

    return base.map((v, i) => this.formatVehicleRecord({
      vehicle_number: v.id,
      driver_name: v.name,
      vehicle_type: v.category,
      region: v.region,
      lat: v.lat,
      lng: v.lng
    }, i));
  }
}

// Global instance
window.fleetManager = new FleetTelemetryManager();