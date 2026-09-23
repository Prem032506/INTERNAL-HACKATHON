import sqlite3
import os

# 150 vehicles from 5 regions
ARGENTINA_VEHICLES = [
    (1, 'Bike', 'AB 102 AA', 'Juan García', 'Argentina', -32.8895, -68.8458),
    (2, 'Bike', 'AB 103 AB', 'Martín López', 'Argentina', -32.8830, -68.8390),
    (3, 'Bike', 'AB 104 AC', 'Diego Fernández', 'Argentina', -32.8950, -68.8520),
    (4, 'Bike', 'AB 105 AD', 'Nicolás Rodríguez', 'Argentina', -32.8780, -68.8310),
    (5, 'Bike', 'AB 106 AE', 'Lucas González', 'Argentina', -32.9020, -68.8480),
    (6, 'Bike', 'AB 107 AF', 'Santiago Pérez', 'Argentina', -32.8910, -68.8610),
    (7, 'Bike', 'AB 108 AG', 'Mateo Sánchez', 'Argentina', -32.8750, -68.8420),
    (8, 'Bike', 'AB 109 AH', 'Tomás Romero', 'Argentina', -32.8860, -68.8250),
    (9, 'Bike', 'AB 110 AJ', 'Federico Díaz', 'Argentina', -32.9100, -68.8350),
    (10, 'Bike', 'AB 111 AK', 'Andrés Torres', 'Argentina', -32.8700, -68.8550),
    (11, 'Car', 'AC 201 AA', 'Carlos García', 'Argentina', -32.8895, -68.8458),
    (12, 'Car', 'AC 202 AB', 'Alejandro López', 'Argentina', -32.8930, -68.8500),
    (13, 'Car', 'AC 203 AC', 'Roberto Fernández', 'Argentina', -32.8820, -68.8400),
    (14, 'Car', 'AC 204 AD', 'Gabriel Rodríguez', 'Argentina', -32.9050, -68.8300),
    (15, 'Car', 'AC 205 AE', 'Pablo González', 'Argentina', -32.8740, -68.8600),
    (16, 'Car', 'AC 206 AF', 'Marcos Pérez', 'Argentina', -32.8850, -68.8700),
    (17, 'Car', 'AC 207 AG', 'Sebastián Sánchez', 'Argentina', -32.9150, -68.8400),
    (18, 'Car', 'AC 208 AH', 'Javier Romero', 'Argentina', -32.8680, -68.8350),
    (19, 'Car', 'AC 209 AJ', 'Fernando Díaz', 'Argentina', -32.8980, -68.8280),
    (20, 'SUV', 'AD 301 AA', 'Ricardo Torres', 'Argentina', -32.8800, -68.8500),
    (21, 'SUV', 'AD 302 AB', 'Mauricio García', 'Argentina', -32.8920, -68.8380),
    (22, 'Jeep', 'AE 401 AC', 'Esteban López', 'Argentina', -32.8200, -69.3500),
    (23, 'Van', 'AF 501 AD', 'Gustavo Fernández', 'Argentina', -32.8850, -68.8450),
    (24, 'Pickup Truck', 'AG 601 AE', 'Hernán Rodríguez', 'Argentina', -32.8500, -69.2000),
    (25, 'Mini Truck', 'AH 701 AF', 'Sergio González', 'Argentina', -32.8890, -68.8410),
    (26, 'Mini Truck', 'AH 702 AG', 'Miguel Pérez', 'Argentina', -32.8790, -68.8520),
    (27, 'Truck', 'AJ 801 AH', 'Oscar Sánchez', 'Argentina', -32.8250, -69.7500),
    (28, 'Taxi', 'AK 901 AJ', 'Daniel Romero', 'Argentina', -32.8900, -68.8460),
    (29, 'Bus', 'AL 1001 AK', 'Claudio Díaz', 'Argentina', -32.8880, -68.8420),
    (30, 'Ambulance', 'AM 1101 AL', 'Martín Torres', 'Argentina', -32.8860, -68.8500),
]

CHILE_VEHICLES = [
    (1, 'Bike', 'AB-CD-21', 'Mateo Rojas', 'Chile', -33.4489, -70.6693),
    (2, 'Bike', 'AB-CD-22', 'Diego Morales', 'Chile', -33.4420, -70.6610),
    (3, 'Bike', 'AB-CD-23', 'Felipe Soto', 'Chile', -33.4550, -70.6750),
    (4, 'Bike', 'AB-CD-24', 'Nicolás Vargas', 'Chile', -33.4380, -70.6550),
    (5, 'Bike', 'AB-CD-25', 'Sebastián Torres', 'Chile', -33.4610, -70.6800),
    (6, 'Bike', 'AB-CD-26', 'Andrés Castillo', 'Chile', -33.4320, -70.6480),
    (7, 'Bike', 'AB-CD-27', 'Javier Muñoz', 'Chile', -33.4680, -70.6850),
    (8, 'Bike', 'AB-CD-28', 'Rodrigo Pérez', 'Chile', -33.4280, -70.6420),
    (9, 'Bike', 'AB-CD-29', 'Cristóbal Silva', 'Chile', -33.4750, -70.6900),
    (10, 'Bike', 'AB-CD-30', 'Tomás González', 'Chile', -33.4220, -70.6380),
    (11, 'Car', 'EF-GH-31', 'Carlos Rojas', 'Chile', -33.4489, -70.6693),
    (12, 'Car', 'EF-GH-32', 'Luis Morales', 'Chile', -33.4450, -70.6640),
    (13, 'Car', 'EF-GH-33', 'Fernando Soto', 'Chile', -33.4520, -70.6720),
    (14, 'Car', 'EF-GH-34', 'Mauricio Vargas', 'Chile', -33.4400, -70.6580),
    (15, 'Car', 'EF-GH-35', 'Ricardo Torres', 'Chile', -33.4580, -70.6780),
    (16, 'Car', 'EF-GH-36', 'Daniel Castillo', 'Chile', -33.4350, -70.6520),
    (17, 'Car', 'EF-GH-37', 'Pablo Muñoz', 'Chile', -33.4640, -70.6830),
    (18, 'Car', 'EF-GH-38', 'Ignacio Pérez', 'Chile', -33.4300, -70.6450),
    (19, 'Car', 'EF-GH-39', 'Martín Silva', 'Chile', -33.4700, -70.6880),
    (20, 'SUV', 'IJ-KL-40', 'Alejandro González', 'Chile', -33.4470, -70.6660),
    (21, 'SUV', 'IJ-KL-41', 'Esteban Rojas', 'Chile', -33.4510, -70.6700),
    (22, 'Jeep', 'MN-OP-42', 'Manuel Morales', 'Chile', -32.8300, -70.1000),
    (23, 'Van', 'QR-ST-43', 'Gonzalo Soto', 'Chile', -33.4460, -70.6680),
    (24, 'Pickup Truck', 'UV-WX-44', 'Héctor Vargas', 'Chile', -32.9000, -70.3000),
    (25, 'Mini Truck', 'YZ-AB-45', 'Patricio Torres', 'Chile', -33.4430, -70.6620),
    (26, 'Mini Truck', 'CD-EF-46', 'Sergio Castillo', 'Chile', -33.4530, -70.6740),
    (27, 'Truck', 'GH-IJ-47', 'Juan Muñoz', 'Chile', -32.8200, -70.0700),
    (28, 'Taxi', 'KL-MN-48', 'Oscar Pérez', 'Chile', -33.4480, -70.6670),
    (29, 'Bus', 'OP-QR-49', 'Claudio Silva', 'Chile', -33.4490, -70.6710),
    (30, 'Ambulance', 'ST-UV-50', 'Roberto González', 'Chile', -33.4440, -70.6650),
]

UTTARAKHAND_VEHICLES = [
    (1, 'Bike', 'UK-01-AB-1021', 'Rohit Rawat', 'Uttarakhand', 30.3165, 78.0322),
    (2, 'Bike', 'UK-01-AB-1022', 'Amit Negi', 'Uttarakhand', 30.3250, 78.0410),
    (3, 'Bike', 'UK-01-AB-1023', 'Sandeep Bisht', 'Uttarakhand', 30.3080, 78.0230),
    (4, 'Bike', 'UK-01-AB-1024', 'Manish Thakur', 'Uttarakhand', 30.3320, 78.0500),
    (5, 'Bike', 'UK-01-AB-1025', 'Deepak Rana', 'Uttarakhand', 30.2990, 78.0150),
    (6, 'Bike', 'UK-01-AB-1026', 'Vikram Singh', 'Uttarakhand', 30.3400, 78.0600),
    (7, 'Bike', 'UK-01-AB-1027', 'Nitin Rawat', 'Uttarakhand', 30.2910, 78.0070),
    (8, 'Bike', 'UK-01-AB-1028', 'Karan Negi', 'Uttarakhand', 30.3480, 78.0700),
    (9, 'Bike', 'UK-01-AB-1029', 'Pankaj Bisht', 'Uttarakhand', 30.2830, 77.9980),
    (10, 'Bike', 'UK-01-AB-1030', 'Mohit Rana', 'Uttarakhand', 30.3560, 78.0800),
    (11, 'Car', 'UK-02-AC-2011', 'Rajesh Rawat', 'Uttarakhand', 30.0869, 78.2676),
    (12, 'Car', 'UK-02-AC-2012', 'Anil Negi', 'Uttarakhand', 30.0950, 78.2750),
    (13, 'Car', 'UK-02-AC-2013', 'Sunil Bisht', 'Uttarakhand', 30.0780, 78.2580),
    (14, 'Car', 'UK-02-AC-2014', 'Dinesh Rana', 'Uttarakhand', 30.1030, 78.2830),
    (15, 'Car', 'UK-02-AC-2015', 'Naveen Thakur', 'Uttarakhand', 30.0700, 78.2490),
    (16, 'Car', 'UK-02-AC-2016', 'Ashish Rawat', 'Uttarakhand', 30.1110, 78.2910),
    (17, 'Car', 'UK-02-AC-2017', 'Sanjay Negi', 'Uttarakhand', 30.0620, 78.2400),
    (18, 'Car', 'UK-02-AC-2018', 'Prakash Bisht', 'Uttarakhand', 30.1190, 78.2990),
    (19, 'Car', 'UK-02-AC-2019', 'Harish Rana', 'Uttarakhand', 30.0540, 78.2310),
    (20, 'SUV', 'UK-03-AD-3011', 'Mahesh Rawat', 'Uttarakhand', 30.1450, 78.5980),
    (21, 'SUV', 'UK-03-AD-3012', 'Devendra Negi', 'Uttarakhand', 30.1550, 78.6100),
    (22, 'Jeep', 'UK-04-AE-4011', 'Ramesh Bisht', 'Uttarakhand', 30.5500, 79.5600),
    (23, 'Van', 'UK-05-AF-5011', 'Yogesh Thakur', 'Uttarakhand', 29.3803, 79.4636),
    (24, 'Pickup Truck', 'UK-06-AG-6011', 'Bhupendra Rawat', 'Uttarakhand', 30.4000, 79.3300),
    (25, 'Mini Truck', 'UK-07-AH-7011', 'Kuldeep Negi', 'Uttarakhand', 30.3165, 78.0322),
    (26, 'Mini Truck', 'UK-07-AH-7012', 'Arjun Bisht', 'Uttarakhand', 30.3200, 78.0380),
    (27, 'Truck', 'UK-08-AJ-8011', 'Mahendra Rana', 'Uttarakhand', 30.7433, 79.4938),
    (28, 'Auto Rickshaw', 'UK-01-AK-9011', 'Sanjeev Rawat', 'Uttarakhand', 30.3150, 78.0300),
    (29, 'Bus', 'UK-02-AL-1001', 'Om Prakash Negi', 'Uttarakhand', 30.3180, 78.0350),
    (30, 'Ambulance', 'UK-01-AM-1101', 'Vijay Thakur', 'Uttarakhand', 30.3140, 78.0280),
]

HIMACHAL_VEHICLES = [
    (1, 'Bike', 'HP-01-A-1021', 'Rakesh Thakur', 'Himachal Pradesh', 31.1048, 77.1734),
    (2, 'Bike', 'HP-01-A-1022', 'Vikram Sharma', 'Himachal Pradesh', 31.1120, 77.1810),
    (3, 'Bike', 'HP-01-A-1023', 'Rohit Negi', 'Himachal Pradesh', 31.0960, 77.1650),
    (4, 'Bike', 'HP-01-A-1024', 'Ankit Rana', 'Himachal Pradesh', 31.1200, 77.1890),
    (5, 'Bike', 'HP-01-A-1025', 'Suresh Thakur', 'Himachal Pradesh', 31.0880, 77.1570),
    (6, 'Bike', 'HP-01-A-1026', 'Karan Verma', 'Himachal Pradesh', 31.1280, 77.1970),
    (7, 'Bike', 'HP-01-A-1027', 'Amit Chauhan', 'Himachal Pradesh', 31.0800, 77.1490),
    (8, 'Bike', 'HP-01-A-1028', 'Deepak Negi', 'Himachal Pradesh', 31.1360, 77.2050),
    (9, 'Bike', 'HP-01-A-1029', 'Mohit Sharma', 'Himachal Pradesh', 31.0720, 77.1410),
    (10, 'Bike', 'HP-01-A-1030', 'Nitin Rana', 'Himachal Pradesh', 31.1440, 77.2130),
    (11, 'Car', 'HP-02-B-2011', 'Rajesh Thakur', 'Himachal Pradesh', 32.2396, 77.1887),
    (12, 'Car', 'HP-02-B-2012', 'Manish Verma', 'Himachal Pradesh', 32.2470, 77.1960),
    (13, 'Car', 'HP-02-B-2013', 'Pankaj Sharma', 'Himachal Pradesh', 32.2310, 77.1800),
    (14, 'Car', 'HP-02-B-2014', 'Sanjay Chauhan', 'Himachal Pradesh', 32.2550, 77.2040),
    (15, 'Car', 'HP-02-B-2015', 'Dinesh Negi', 'Himachal Pradesh', 32.2230, 77.1720),
    (16, 'Car', 'HP-02-B-2016', 'Naveen Thakur', 'Himachal Pradesh', 32.2630, 77.2120),
    (17, 'Car', 'HP-02-B-2017', 'Ajay Rana', 'Himachal Pradesh', 32.2150, 77.1640),
    (18, 'Car', 'HP-02-B-2018', 'Sunil Verma', 'Himachal Pradesh', 32.2710, 77.2200),
    (19, 'Car', 'HP-02-B-2019', 'Vijay Sharma', 'Himachal Pradesh', 32.2070, 77.1560),
    (20, 'SUV', 'HP-03-C-3011', 'Harish Thakur', 'Himachal Pradesh', 31.9579, 77.1095),
    (21, 'SUV', 'HP-03-C-3012', 'Ramesh Chauhan', 'Himachal Pradesh', 31.9680, 77.1190),
    (22, 'Jeep', 'HP-04-D-4011', 'Devendra Negi', 'Himachal Pradesh', 32.3600, 77.1400),
    (23, 'Van', 'HP-05-E-5011', 'Prakash Rana', 'Himachal Pradesh', 32.2190, 76.3234),
    (24, 'Pickup Truck', 'HP-06-F-6011', 'Mahendra Thakur', 'Himachal Pradesh', 32.5700, 77.0300),
    (25, 'Mini Truck', 'HP-07-G-7011', 'Kuldeep Sharma', 'Himachal Pradesh', 31.1048, 77.1734),
    (26, 'Mini Truck', 'HP-07-G-7012', 'Bhupinder Rana', 'Himachal Pradesh', 31.1100, 77.1790),
    (27, 'Truck', 'HP-08-H-8011', 'Raj Kumar Thakur', 'Himachal Pradesh', 32.9000, 77.5800),
    (28, 'Auto Rickshaw', 'HP-09-J-9011', 'Sanjeev Chauhan', 'Himachal Pradesh', 31.1030, 77.1710),
    (29, 'Bus', 'HP-10-K-1001', 'Om Prakash Negi', 'Himachal Pradesh', 31.1060, 77.1750),
    (30, 'Ambulance', 'HP-11-L-1101', 'Arjun Thakur', 'Himachal Pradesh', 31.1040, 77.1720),
]

JAMMU_KASHMIR_VEHICLES = [
    (1, 'Bike', 'JK-01-AB-1021', 'Aamir Dar', 'Jammu & Kashmir', 34.0837, 74.7973),
    (2, 'Bike', 'JK-01-AB-1022', 'Adil Khan', 'Jammu & Kashmir', 34.0910, 74.8050),
    (3, 'Bike', 'JK-01-AB-1023', 'Imran Bhat', 'Jammu & Kashmir', 34.0750, 74.7890),
    (4, 'Bike', 'JK-01-AB-1024', 'Danish Malik', 'Jammu & Kashmir', 34.0990, 74.8130),
    (5, 'Bike', 'JK-01-AB-1025', 'Arif Ahmad', 'Jammu & Kashmir', 34.0670, 74.7810),
    (6, 'Bike', 'JK-01-AB-1026', 'Sameer Wani', 'Jammu & Kashmir', 34.1070, 74.8210),
    (7, 'Bike', 'JK-01-AB-1027', 'Bilal Hussain', 'Jammu & Kashmir', 34.0590, 74.7730),
    (8, 'Bike', 'JK-01-AB-1028', 'Irfan Sheikh', 'Jammu & Kashmir', 34.1150, 74.8290),
    (9, 'Bike', 'JK-01-AB-1029', 'Faizan Mir', 'Jammu & Kashmir', 34.0510, 74.7650),
    (10, 'Bike', 'JK-01-AB-1030', 'Yasir Ahmad', 'Jammu & Kashmir', 34.1230, 74.8370),
    (11, 'Car', 'JK-02-AC-2011', 'Zahoor Ahmad', 'Jammu & Kashmir', 32.7266, 74.8570),
    (12, 'Car', 'JK-02-AC-2012', 'Shabir Hussain', 'Jammu & Kashmir', 32.7340, 74.8650),
    (13, 'Car', 'JK-02-AC-2013', 'Tariq Bhat', 'Jammu & Kashmir', 32.7180, 74.8490),
    (14, 'Car', 'JK-02-AC-2014', 'Javed Malik', 'Jammu & Kashmir', 32.7420, 74.8730),
    (15, 'Car', 'JK-02-AC-2015', 'Nisar Ahmad', 'Jammu & Kashmir', 32.7100, 74.8410),
    (16, 'Car', 'JK-02-AC-2016', 'Riyaz Wani', 'Jammu & Kashmir', 32.7500, 74.8810),
    (17, 'Car', 'JK-02-AC-2017', 'Mushtaq Dar', 'Jammu & Kashmir', 32.7020, 74.8330),
    (18, 'Car', 'JK-02-AC-2018', 'Farooq Sheikh', 'Jammu & Kashmir', 32.7580, 74.8890),
    (19, 'Car', 'JK-02-AC-2019', 'Sameer Bhat', 'Jammu & Kashmir', 32.6940, 74.8250),
    (20, 'SUV', 'JK-04-AD-3011', 'Abdul Rashid', 'Jammu & Kashmir', 33.7311, 75.1487),
    (21, 'SUV', 'JK-04-AD-3012', 'Umar Ahmad', 'Jammu & Kashmir', 33.7420, 75.1590),
    (22, 'Jeep', 'JK-05-AE-4011', 'Showkat Hussain', 'Jammu & Kashmir', 34.2800, 75.1500),
    (23, 'Van', 'JK-01-AF-5011', 'Ghulam Nabi', 'Jammu & Kashmir', 34.2090, 74.3436),
    (24, 'Pickup Truck', 'JK-02-AG-6011', 'Bashir Ahmad', 'Jammu & Kashmir', 33.2500, 75.2500),
    (25, 'Mini Truck', 'JK-03-AH-7011', 'Nazir Hussain', 'Jammu & Kashmir', 34.0837, 74.7973),
    (26, 'Mini Truck', 'JK-03-AH-7012', 'Abdul Majid', 'Jammu & Kashmir', 34.0890, 74.8020),
    (27, 'Truck', 'JK-04-AJ-8011', 'Mohammad Yousuf', 'Jammu & Kashmir', 34.5500, 76.1300),
    (28, 'Auto Rickshaw', 'JK-01-AK-9011', 'Rashid Ahmad', 'Jammu & Kashmir', 34.0820, 74.7950),
    (29, 'Bus', 'JK-02-AL-1001', 'Manzoor Ahmad', 'Jammu & Kashmir', 34.0850, 74.8000),
    (30, 'Ambulance', 'JK-01-AM-1101', 'Junaid Hussain', 'Jammu & Kashmir', 34.0840, 74.7960),
]

ALL_NEW_DATASETS = [
    ('Argentina', ARGENTINA_VEHICLES),
    ('Chile', CHILE_VEHICLES),
    ('Uttarakhand', UTTARAKHAND_VEHICLES),
    ('Himachal Pradesh', HIMACHAL_VEHICLES),
    ('Jammu & Kashmir', JAMMU_KASHMIR_VEHICLES),
]

def populate_sqlite():
    db_path = os.path.join(os.path.dirname(__file__), 'vehicle_data.db')
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Check existing schema or recreate
    cur.execute("DROP TABLE IF EXISTS vehicles")
    cur.execute("""
        CREATE TABLE vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_number TEXT UNIQUE,
            vehicle_type TEXT,
            driver_name TEXT,
            region TEXT,
            lat REAL,
            lng REAL,
            contact TEXT DEFAULT '',
            cargo TEXT DEFAULT 'Essential Relief Supplies',
            status TEXT DEFAULT 'Active'
        )
    """)
        
    print("Populating SQLite vehicles table...")
    count = 0
    # Seed NER vehicles
    ner_vehicles = [
        ("NER-MED-101", "Cold-Chain Reefer (WHO 2-8°C)", "Tsering Dorjee", "North Eastern Region", 26.3500, 92.1000, "+91 98621 44510", "3,200 Vials Vaccines & Insulin", "In-Transit"),
        ("NER-OXY-204", "Cryo LMO Tanker (20 Ton)", "Rajen Bora", "North Eastern Region", 25.8200, 93.8500, "+91 94350 88219", "18.5 MT Liquid Medical Oxygen", "Rerouting (SOS)"),
        ("NER-PDS-309", "Heavy Grain Carrier (FCI)", "Biplab Debbarma", "North Eastern Region", 24.5000, 92.7000, "+91 87941 12093", "450 Qtl Fortified Rice & Wheat", "In-Transit"),
        ("NER-NDRF-007", "Disaster Relief & Rescue Convoy", "Sub-Inspector M. K. Sharma", "North Eastern Region", 26.8500, 88.4500, "+91 94361 77102", "Satellite Comms & Inflatable Boats", "Priority Green Corridor"),
        ("NER-PET-512", "POL Fuel Tanker (IOCL)", "Lalthlamuana", "North Eastern Region", 24.1000, 91.8000, "+91 97740 33811", "24,000L Aviation Turbine Fuel", "In-Transit")
    ]
    for plate, v_type, driver, reg, lat, lng, contact, cargo, status in ner_vehicles:
        cur.execute("""
            INSERT INTO vehicles (vehicle_number, vehicle_type, driver_name, region, lat, lng, contact, cargo, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (plate, v_type, driver, reg, lat, lng, contact, cargo, status))
        count += 1

    for region_name, v_list in ALL_NEW_DATASETS:
        for idx, v_type, plate, driver, reg, lat, lng in v_list:
            cur.execute("""
                INSERT INTO vehicles (vehicle_number, vehicle_type, driver_name, region, lat, lng, contact, cargo, status)
                VALUES (?, ?, ?, ?, ?, ?, '', 'Essential Relief Supplies', 'Active')
            """, (plate, v_type, driver, reg, lat, lng))
            count += 1
            
    # Also add sample Gunupur / Odisha vehicles if not already present
    odisha_vehicles = [
        ('OD 18 AB 1021', 'Bike', 'Rakesh Sahu', 'Odisha', 19.0714, 83.81488),
        ('OD 18 AB 1022', 'Bike', 'Suman Behera', 'Odisha', 19.0697, 83.81044),
        ('OD 18 AC 2011', 'Car', 'Ramesh Sahu', 'Odisha', 19.06926, 83.81228),
        ('OD 18 AE 4011', 'Pickup Truck', 'Dhiren Behera', 'Odisha', 19.0473, 83.8311),
        ('OD 18 AF 5011', 'Mini Truck', 'Raju Sahu', 'Odisha', 19.0717, 83.80931),
        ('OD 18 AG 6011', 'Truck', 'Mahendra Sahu', 'Odisha', 19.0664, 83.8258),
        ('OD 18 AM 1101', 'Ambulance', 'Sunil Sahu', 'Odisha', 19.0712, 83.8101),
    ]
    for plate, v_type, driver, reg, lat, lng in odisha_vehicles:
        cur.execute("""
            INSERT INTO vehicles (vehicle_number, vehicle_type, driver_name, region, lat, lng, contact, cargo, status)
            VALUES (?, ?, ?, ?, ?, ?, '', 'Emergency Supply', 'Active')
            ON CONFLICT(vehicle_number) DO UPDATE SET
                vehicle_type = excluded.vehicle_type,
                driver_name = excluded.driver_name,
                region = excluded.region,
                lat = excluded.lat,
                lng = excluded.lng
        """, (plate, v_type, driver, reg, lat, lng))
        
    conn.commit()
    cur.execute("SELECT count(*) FROM vehicles")
    total = cur.fetchone()[0]
    conn.close()
    print(f"Total vehicles in SQLite: {total}")

def populate_excel():
    excel_path = os.path.join(os.path.dirname(__file__), 'vehicle_users_data.xlsx')
    
    try:
        import pandas as pd
        import openpyxl
        
        # Read existing or create dataframe
        if os.path.exists(excel_path):
            try:
                df_existing = pd.read_excel(excel_path)
            except Exception as e:
                df_existing = pd.DataFrame(columns=['No.', 'Vehicle Type', 'Number Plate', 'Registered Person Name', 'Region'])
        else:
            df_existing = pd.DataFrame(columns=['No.', 'Vehicle Type', 'Number Plate', 'Registered Person Name', 'Region'])
            
        rows = []
        # Add new 150 rows
        start_no = len(df_existing) + 1 if 'No.' in df_existing.columns else 1
        curr_no = start_no
        
        existing_plates = set(df_existing['Number Plate'].astype(str).str.strip().str.upper()) if not df_existing.empty and 'Number Plate' in df_existing.columns else set()
        
        for region_name, v_list in ALL_NEW_DATASETS:
            for idx, v_type, plate, driver, reg, lat, lng in v_list:
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
            df_combined = pd.concat([df_existing, df_new], ignore_index=True)
            df_combined.to_excel(excel_path, index=False)
            print(f"Added {len(rows)} new vehicles to vehicle_users_data.xlsx. Total rows: {len(df_combined)}")
        else:
            print("All vehicles already present in vehicle_users_data.xlsx")
            
    except Exception as e:
        print("Excel population error:", e)

if __name__ == '__main__':
    populate_sqlite()
    populate_excel()
