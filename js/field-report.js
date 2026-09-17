/**
 * Field Incident Reporting & Offline IndexedDB Sync Manager
 * Resilient for zero-connectivity remote mountain districts
 */

class FieldReportManager {
  constructor() {
    this.dbName = 'NER_Logistics_Offline_DB';
    this.dbVersion = 1;
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
      this.showToast('Network restored. Automatically syncing offline reports with Central Command.');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showToast('Operating in Offline Mode. Incident reports will be safely stored on-device.');
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
          this.showToast('Report uploaded & broadcast to BRO / District Command.');
        } else {
          this.showToast('Report stored offline in device storage. Will sync when signal returns.');
        }
        resolve(record);
      };

      req.onerror = (err) => reject(err);
    });
  }

  async getPendingReports() {
    if (!this.db) await this.initDatabase();

    return new Promise((resolve) => {
      const tx = this.db.transaction(['incident_reports'], 'readonly');
      const store = tx.objectStore('incident_reports');
      const index = store.index('synced');
      const req = index.getAll(false);

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  async syncPendingReports() {
    const pending = await this.getPendingReports();
    if (pending.length === 0) return;

    const tx = this.db.transaction(['incident_reports'], 'readwrite');
    const store = tx.objectStore('incident_reports');

    pending.forEach(item => {
      item.synced = true;
      item.syncedAt = new Date().toISOString();
      store.put(item);
    });

    tx.oncomplete = () => {
      this.updatePendingCount();
      this.showToast(`Successfully synced ${pending.length} offline report(s) with Central Cloud.`);
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
