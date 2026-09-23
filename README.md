# GLOBAL-SETU 🌐🛰️
### AI-Based Smart Logistics & Disaster Accessibility Intelligence Platform
**Focus Region: North Eastern Region (NER) of India**

---

## 🚀 Overview

**GLOBAL-SETU** is an operational Command & Control web platform built to provide real-time road accessibility analysis, disaster hazard forecasting, and resilient logistics rerouting across India's North Eastern Region (NER).

The system operates autonomously with zero external API dependencies, utilizing an embedded Random Forest machine learning classifier, SQLite persistent state database, and dynamic Dijkstra / A* route intelligence.

---

## 🌟 Key Features

1. **North Eastern Region (NER) GIS Map**
   - Interactive GIS map powered by Leaflet, visualizing inter-state highways, critical road segments, elevation gradients, and active disaster zones.
2. **AI Road Risk Intelligence & ML Classifier**
   - 120-tree Random Forest classifier predicting composite risk scores (LOW, MODERATE, HIGH, CRITICAL) based on precipitation, terrain slope, road surface quality, elevation, and historical incident history.
3. **Resilient Route Intelligence (Dijkstra / A\*)**
   - Dynamic routing engine calculating safe bypass paths between major NER logistics nodes (Guwahati, Shillong, Imphal, Agartala, Kohima, Aizawl, Itanagar, Silchar) avoiding active disaster blockages.
4. **Extreme Weather Simulation Engine**
   - Real-time simulation of heavy monsoonal cloudbursts, dynamically triggering road degradations, automatic emergency alerts, and immediate rerouting calculations.
5. **Logistics & Relief Convoy Management**
   - End-to-end convoy tracking, priority cargo scheduling (medical, food, fuel), and automated driver dispatch alerts.
6. **Field Reporting & Incident Verification**
   - Crowd-sourced and field officer incident submission portal with live status verification.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 19, Vite, Leaflet, React-Leaflet, Recharts, Lucide Icons, Vanilla CSS Design System.
- **Backend:** Python Flask REST API, CORS enabled, unified static bundle serving.
- **Machine Learning:** Scikit-Learn Random Forest Classifier (`ml/model.pkl`), Joblib, NumPy, Pandas.
- **Database:** SQLite (`database/global_setu.db`).

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Install & Run Unified Platform

```bash
# 1. Install Backend Dependencies
pip install -r requirements.txt

# 2. Build Frontend
cd frontend
npm install
npm run build
cd ..

# 3. Start Backend & Unified Server
python backend/app.py
```
Visit **http://127.0.0.1:5000** in your browser.

---

## ☁️ Deployment

### 1-Click Render.com Deployment
This repository includes a `render.yaml` specification for zero-config deployment:
1. Link this repository on [Render](https://render.com).
2. Choose **Web Service**.
3. Build Command: `cd frontend && npm install && npm run build && cd .. && pip install -r requirements.txt`
4. Start Command: `gunicorn backend.app:app`

---

## 👥 Authors
Built for Smart India Hackathon (SIH) 2026.
