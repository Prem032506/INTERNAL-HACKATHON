/**
 * Real-world highway polyline coordinates following actual highway routes and mountain contours
 * according to Google Maps & National Highway alignments in the North Eastern Region of India.
 */

export const REAL_HIGHWAY_WAYPOINTS = {
  // RD_01: NH-27 Guwahati to Tezpur via Nagaon / Kaliabor
  RD_01: [
    [26.1445, 91.7362], // Guwahati
    [26.1750, 91.9500], // Sonapur
    [26.1830, 92.2000], // Jagiroad
    [26.2400, 92.5100], // Raha
    [26.3450, 92.6850], // Nagaon
    [26.5400, 92.9500], // Kaliabor
    [26.6000, 92.8800], // Kolia Bhomora Setu (Brahmaputra Bridge)
    [26.6528, 92.7926]  // Tezpur
  ],

  // RD_02: NH-40 Guwahati to Shillong Mountain Highway
  RD_02: [
    [26.1445, 91.7362], // Guwahati
    [26.0950, 91.8100], // Khanapara / Beltola
    [26.0100, 91.8700], // Burnihat (Assam-Meghalaya Border)
    [25.9050, 91.8800], // Nongpoh (Hill Ascent)
    [25.7500, 91.9100], // Umsning
    [25.6600, 91.9050], // Umiam Lake (Barapani)
    [25.6050, 91.8850], // Mawlai
    [25.5788, 91.8933]  // Shillong
  ],

  // RD_03: NH-15 Tezpur to Itanagar Trans-Highway
  RD_03: [
    [26.6528, 92.7926], // Tezpur
    [26.7800, 92.9000], // Balipara
    [26.8500, 93.1500], // Jamugurihat
    [26.9800, 93.4200], // Gohpur / Banderdewa Entry
    [27.0844, 93.6053]  // Itanagar
  ],

  // RD_04: NH-715 Tezpur to Jorhat via Kaziranga
  RD_04: [
    [26.6528, 92.7926], // Tezpur
    [26.6000, 92.8800], // Kolia Bhomora Setu
    [26.5800, 93.1800], // Jakhalabandha
    [26.6000, 93.3800], // Bagori (Kaziranga West)
    [26.5800, 93.5200], // Kohora (Kaziranga Central)
    [26.6300, 93.8800], // Bokakhat
    [26.6800, 94.0200], // Dergaon
    [26.7509, 94.2037]  // Jorhat
  ],

  // RD_05: NH-29 Dimapur to Kohima Hill Gorge Pass
  RD_05: [
    [25.9060, 93.7270], // Dimapur
    [25.8200, 93.7650], // Chümoukedima Checkpost
    [25.7950, 93.8500], // Pherima
    [25.7500, 93.9200], // Medziphema Hill Ascent
    [25.7100, 94.0200], // Dzüdza River Valley
    [25.6850, 94.0600], // Zubza
    [25.6751, 94.1086]  // Kohima
  ],

  // RD_06: NH-02 Kohima to Imphal Frontier Corridor
  RD_06: [
    [25.6751, 94.1086], // Kohima
    [25.5600, 94.1250], // Kigwema
    [25.5000, 94.1350], // Viswema
    [25.4200, 94.1400], // Mao (Nagaland-Manipur Border Pass)
    [25.3200, 94.1100], // Maram
    [25.2600, 94.0200], // Senapati
    [25.0100, 93.9700], // Kangpokpi
    [24.8700, 93.9200], // Sekmai
    [24.8170, 93.9368]  // Imphal
  ],

  // RD_07: NH-06 Shillong to Silchar (Jowai, Sonapur Tunnel)
  RD_07: [
    [25.5788, 91.8933], // Shillong
    [25.5500, 92.0500], // Mawryngkneng
    [25.4400, 92.2100], // Jowai
    [25.3200, 92.3500], // Lad Rymbai
    [25.2100, 92.4200], // Khliehriat
    [25.1200, 92.3800], // Sonapur Tunnel (Active Landslide Sector)
    [25.0100, 92.4600], // Lumshnong
    [24.9000, 92.6000], // Kalain (Assam Border)
    [24.8800, 92.6800], // Badarpur
    [24.8333, 92.7789]  // Silchar
  ],

  // RD_08: NH-306 Silchar to Aizawl Mountain Link
  RD_08: [
    [24.8333, 92.7789], // Silchar
    [24.6800, 92.7200], // Kabuganj
    [24.4800, 92.7000], // Vairengte (Mizoram Entry Gate)
    [24.3100, 92.6800], // Bilkhawthlir
    [24.2200, 92.6700], // Kolasib (Mountain Crest)
    [23.9500, 92.6900], // Durtlang Hills
    [23.7271, 92.7176]  // Aizawl
  ],

  // RD_09: NH-08 Silchar to Agartala Lifeline
  RD_09: [
    [24.8333, 92.7789], // Silchar
    [24.8800, 92.6800], // Badarpur
    [24.8600, 92.3500], // Karimganj
    [24.6500, 92.2200], // Patharkandi
    [24.5200, 92.2100], // Churaibari (Assam-Tripura Border)
    [24.3800, 92.1700], // Dharmanagar
    [24.1800, 92.0100], // Kumarghat
    [23.9200, 91.8500], // Ambassa
    [23.8200, 91.6200], // Teliamura
    [23.8315, 91.2868]  // Agartala
  ],

  // RD_10: NH-10 Siliguri to Gangtok (Teesta River Gorge)
  RD_10: [
    [26.7271, 88.3953], // Siliguri
    [26.8500, 88.4700], // Sevoke (Coronation Bridge)
    [26.9200, 88.4600], // Kalijhora
    [27.0200, 88.4800], // 29th Mile (Vulnerable Erosion Sector)
    [27.0600, 88.4900], // Teesta Bazaar
    [27.1100, 88.5100], // Melli
    [27.1800, 88.5200], // Rangpo (Sikkim Border Gate)
    [27.2300, 88.5100], // Singtam
    [27.2900, 88.5800], // Ranipool
    [27.3389, 88.6065]  // Gangtok
  ],

  // RD_11: NH-27 Siliguri to Guwahati (East-West Corridor, avoiding Bangladesh)
  RD_11: [
    [26.7271, 88.3953], // Siliguri
    [26.5400, 88.7100], // Jalpaiguri
    [26.5800, 89.0200], // Mainaguri
    [26.5200, 89.3800], // Falakata
    [26.4800, 89.5200], // Alipurduar
    [26.4900, 89.8800], // Boxirhat (West Bengal-Assam Border)
    [26.4500, 90.1500], // Bilasipara
    [26.5000, 90.5500], // Bongaigaon
    [26.5200, 90.9800], // Barpeta Road
    [26.4400, 91.2200], // Tihu
    [26.4300, 91.4300], // Nalbari
    [26.3200, 91.6800], // Baihata Chariali
    [26.2500, 91.7100], // Saraighat Bridge over Brahmaputra
    [26.1445, 91.7362]  // Guwahati
  ],

  // RD_12: NH-29 Jorhat to Dimapur
  RD_12: [
    [26.7509, 94.2037], // Jorhat
    [26.5800, 93.9700], // Golaghat
    [26.3100, 93.9000], // Numaligarh
    [26.1000, 93.8100], // Bokajan (Assam-Nagaland Border)
    [25.9060, 93.7270]  // Dimapur
  ],

  // RD_13: NH-37 Jorhat to Dibrugarh
  RD_13: [
    [26.7509, 94.2037], // Jorhat
    [26.8500, 94.4000], // Jhanji
    [26.9800, 94.6300], // Sivasagar
    [27.1800, 94.8800], // Moranhat
    [27.4728, 94.9120]  // Dibrugarh
  ],

  // RD_14: NH-13 Bhalukpong to Tawang (Sela Pass Mountain Highway)
  RD_14: [
    [27.0844, 93.6053], // Itanagar
    [27.0100, 92.6500], // Bhalukpong
    [27.1500, 92.5100], // Tenga Valley
    [27.2600, 92.4200], // Bomdila (High Altitude Pass)
    [27.3500, 92.2400], // Dirang
    [27.5000, 92.1000], // Sela Pass (13,700 ft)
    [27.5500, 91.9500], // Jang
    [27.5860, 91.8656]  // Tawang
  ],

  // RD_15: NH-52 Dibrugarh to Pasighat via Bogibeel Bridge
  RD_15: [
    [27.4728, 94.9120], // Dibrugarh
    [27.4900, 94.8500], // Bogibeel Bridge over Brahmaputra
    [27.6500, 94.8200], // Dhemaji
    [27.8200, 95.0500], // Jonai
    [27.9500, 95.2200], // Ruksin
    [28.0667, 95.3333]  // Pasighat
  ],

  // RD_20: NH-37A Guwahati to Dimapur via Nagaon & Golaghat
  RD_20: [
    [26.1445, 91.7362], // Guwahati
    [26.2400, 92.5100], // Raha
    [26.3450, 92.6850], // Nagaon
    [26.5800, 93.5200], // Kaziranga
    [26.5800, 93.9700], // Golaghat
    [26.1000, 93.8100], // Bokajan
    [25.9060, 93.7270]  // Dimapur
  ],

  // RD_22: NH-53 Silchar to Imphal Western Alternative (Jiribam)
  RD_22: [
    [24.8333, 92.7789], // Silchar
    [24.8000, 93.1200], // Jiribam (Manipur Border)
    [24.8500, 93.4200], // Nungba
    [24.8200, 93.7100], // Noney
    [24.8170, 93.9368]  // Imphal
  ],

  // RD_24: NH-717A Siliguri to Gangtok Monsoon Bypass (Lava-Reshi Pass)
  RD_24: [
    [26.7271, 88.3953], // Siliguri
    [26.8500, 88.6200], // Damdim / Malbazar
    [27.0100, 88.6600], // Gorubathan
    [27.0800, 88.6500], // Lava
    [27.1500, 88.6300], // Reshi (Rishi Khola River)
    [27.2200, 88.5800], // Rhenock
    [27.2500, 88.5600], // Pakyong (Airport Ridge)
    [27.3389, 88.6065]  // Gangtok
  ]
};

/**
 * Returns either the realistic curving highway coordinates or straight line between start and end.
 */
export function getRoadCoordinates(road) {
  if (REAL_HIGHWAY_WAYPOINTS[road.road_id]) {
    return REAL_HIGHWAY_WAYPOINTS[road.road_id];
  }
  return [
    [parseFloat(road.lat1), parseFloat(road.lon1)],
    [parseFloat(road.lat2), parseFloat(road.lon2)]
  ];
}
