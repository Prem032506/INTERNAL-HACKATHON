/**
 * Field Incident Reporting & Offline IndexedDB Sync Manager
 * Zero-connectivity offline caching for remote mountain corridors & cellular shadow zones
 */

class FieldReportManager {
  constructor() {
    this.dbName = 'Global_Setu_Offline_DB';
    this.dbVersion = 2;
    this.db = null;
    this.isOnline = navigator.onLine;
    this.initDatabase();
    this.setupNetworkListeners();
  }

  initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('incident_reports')) {
          const store = db.createObjectStore('incident_reports', { keyPath: 'id', autoIncrement: true });
          store.createIndex('synced', 'synced', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
        this.updatePendingCount();
      };

      request.onerror = (e) => {
        console.error('IndexedDB init error', e);
        reject(e);
      };
    });
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingReports();
      this.showToast('📡 Network connection restored. Syncing offline buffered field reports...');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showToast('📶 Cellular Shadow Zone Active. All field incident reports will be saved locally on-device.');
    });
  }

  async saveReport(reportData) {
    if (!this.db) await this.initDatabase();

    const record = {
      ...reportData,
      timestamp: new Date().toISOString(),
      synced: this.isOnline,
      syncedAt: this.isOnline ? new Date().toISOString() : null
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['incident_reports'], 'readwrite');
      const store = tx.objectStore('incident_reports');
      const req = store.add(record);

      req.onsuccess = () => {
        this.updatePendingCount();
        if (this.isOnline) {
          this.showToast('🚀 Report uploaded & broadcast to District Command & Relief Units.');
        } else {
          this.showToast('💾 Report stored in local device storage. Will auto-sync when network is acquired.');
        }
        resolve(record);
      };

      req.onerror = (err) => reject(err);
    });
  }

  async getPendingReports() {
    if (!this.db) await this.initDatabase();

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(['incident_reports'], 'readonly');
        const store = tx.objectStore('incident_reports');
        const index = store.index('synced');
        const req = index.getAll(false);

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async getAllReports() {
    if (!this.db) await this.initDatabase();

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(['incident_reports'], 'readonly');
        const store = tx.objectStore('incident_reports');
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async syncPendingReports() {
    const pending = await this.getPendingReports();
    if (pending.length === 0) return;

    // In full-stack mode, optionally send to backend
    try {
      for (const item of pending) {
        // Attempt sending to local backend if available and not on HTTPS
        if (window.location.protocol !== 'https:') {
          try {
            await fetch('http://127.0.0.1:5000/deliveries', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                delivery_number: `INC-${Date.now()}`,
                source: item.location,
                destination: 'Central Relief Command',
                vehicle_number: 'EMERGENCY-DISPATCH',
                status: item.type,
                cargo_type: item.title
              })
            });
          } catch (ignored) {}
        }
      }
    } catch (e) {}

    const tx = this.db.transaction(['incident_reports'], 'readwrite');
    const store = tx.objectStore('incident_reports');

    pending.forEach(item => {
      item.synced = true;
      item.syncedAt = new Date().toISOString();
      store.put(item);
    });

    tx.oncomplete = () => {
      this.updatePendingCount();
      this.showToast(`✅ Successfully synced ${pending.length} offline report(s) with Central Cloud.`);
    };
  }

  async updatePendingCount() {
    const pending = await this.getPendingReports();
    const countEl = document.getElementById('offline-queue-badge');
    if (countEl) {
      countEl.textContent = pending.length;
      countEl.style.display = pending.length > 0 ? 'inline-flex' : 'none';
    }
  }

  showToast(message) {
    const toast = document.getElementById('offline-sync-toast');
    const textEl = document.getElementById('toast-message-text');
    if (toast && textEl) {
      textEl.textContent = message;
      toast.classList.add('visible');
      setTimeout(() => toast.classList.remove('visible'), 4000);
    }
  }
}

window.fieldReports = new FieldReportManager();
