# Global-Setu | AI-Based Smart Logistics & Disaster Accessibility Intelligence Platform

An open, globally deployable, disaster-resilient AI platform designed to overcome severe mountain topography, extreme climate disruptions, and communication blackouts across vulnerable logistics corridors worldwide (North East India, Northern Himalayan Arc, European Alps, South American Andes, and Southeast Asian disaster zones).

---

## 🌟 What Makes Global-Setu "Global for Everyone"?

1. **Multi-Region Geographical Switcher**:
   - 🇮🇳 **North Eastern Region (NER, India)**: Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Sikkim.
   - 🏔️ **Northern Himalayan Arc**: Ladakh (Zoji La), J&K (NH-44), Uttarakhand (Joshimath, Char Dham), Himachal Pradesh (Atal Tunnel).
   - 🇪🇺 **European Alps Corridor**: Gotthard Pass (Switzerland), Brenner Pass (Austria-Italy), Mont Blanc (France).
   - 🏔️ **South American Andes**: Paso Internacional Los Libertadores (Chile-Argentina).
   - *Instantly switch regions with smooth camera transitions and real-time corridor hazard overlays!*

2. **11 International & Regional Languages**:
   - 🇺🇸 English (Global Official)
   - 🇪🇸 Spanish (Español)
   - 🇫🇷 French (Français)
   - 🇩🇪 German (Deutsch)
   - 🇯🇵 Japanese (日本語)
   - 🇨🇳 Mandarin Chinese (中文)
   - 🇸🇦 Arabic (العربية)
   - 🇮🇳 Hindi (हिन्दी)
   - 🇮🇳 Assamese (অসমীয়া)
   - 🇮🇳 Bengali (বাংলা)
   - 🇮🇳 Manipuri (মৈতৈলোন্)

3. **International Humanitarian & UN Compliance**:
   - Aligned with **UN OCHA** humanitarian access protocols.
   - **WHO** Cold-Chain Compliance (2–8°C) with automated thermal telemetry.
   - **WFP (World Food Programme)** disaster food security monitoring.
   - **NDRF & BRO** disaster response and landslide mitigation workflows.

4. **100% Offline-First for Remote Cellular Shadow Zones**:
   - Progressive Web App (PWA) using browser **IndexedDB local storage** and Service Workers.
   - Field responders and drivers can log geo-tagged incident photos with zero cellular connectivity; reports automatically synchronize when connectivity resumes.

---

## 🚀 How to Run & Deploy Globally for Everyone

### Method 1: Instant Standalone Local Run (100% Offline-First)
```powershell
python -m http.server 8080 --bind 0.0.0.0
```
- Open on your computer: [http://localhost:8080](http://localhost:8080)
- Open from mobile / other devices on your WiFi/LAN: `http://<your-ip-address>:8080`
- Runs 100% offline with zero dependencies, IndexedDB caching, full multi-region GIS routing, and simulation tools.

### Method 2: Full-Stack Mode (Python Flask Backend + Database)
```powershell
# 1. Install backend requirements
pip install -r backend/requirements.txt

# 2. Run Flask API backend (Port 5000)
python backend/app.py

# 3. Serve Frontend (Port 8080 in a separate terminal)
python -m http.server 8080
```

### Method 3: Docker / Docker Compose (1-Command Deployment)
```bash
docker compose up -d
```
Runs a production Nginx container serving Global-Setu on port 8080.

### Method 4: 1-Click Vercel / Netlify Edge Deployment
```bash
npx vercel --prod
# OR
npx netlify deploy --prod
```

### Method 5: Automated GitHub Pages Global Hosting
Push this codebase to GitHub (`main` branch). The workflow in `.github/workflows/deploy.yml` automatically hosts the live platform.

---

## 📦 Complete Platform Deliverables Suite

- **Command Center & Live GIS Dashboard:** [index.html](index.html) (`http://localhost:8080/index.html`)
- **Pitch PPT Presentation Deck (12 Slides):** [presentation.html](presentation.html) (`http://localhost:8080/presentation.html`)
- **System Block Diagrams & Flowcharts:** [architecture.html](architecture.html) (`http://localhost:8080/architecture.html`)
- **Official Technical Solution Document:** [document.html](document.html) & [PROPOSED_SOLUTION_DOCUMENT.md](PROPOSED_SOLUTION_DOCUMENT.md)

---

## ⌨️ Presentation Keyboard Controls
- `➡️` / `Space` / `PageDown`: Next Slide
- `⬅️` / `PageUp`: Previous Slide
- `F`: Toggle Fullscreen Presentation Mode
- `P`: Toggle Speaker Pitch Notes Drawer
- `🖨️ Export PDF`: Export deck as 16:9 PDF presentation

---
*Global-Setu — AI-Driven Logistics Resilience for Everyone, Everywhere.*
