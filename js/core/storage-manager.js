/* ==========================================================================
 * SIAKAD SAGE — STORAGE MANAGER
 * Penyimpanan lokal 100%, folder pilihan user, auto-backup JSON setiap perubahan.
 *
 * Komponen:
 *  1. Patch localStorage -> mendeteksi setiap perubahan data aplikasi.
 *  2. File System Access API -> user memilih folder komputer sendiri.
 *  3. IndexedDB -> menyimpan izin folder agar tetap terhubung setelah refresh.
 *  4. Auto backup (latest + riwayat dengan rotasi) + auto restore saat dibuka.
 *  5. Export / import JSON dengan mode timpa atau gabung.
 * ========================================================================== */
(function (global) {
  'use strict';

  const DB_NAME = 'siakad_sage_storage';
  const DB_STORE = 'handles';
  const HANDLE_KEY = 'folder_handle';

  const LATEST_FILE = 'DATABASE_SIAKAD_AUTOSAVE.json';
  const HISTORY_DIR = 'RIWAYAT_BACKUP';
  const HISTORY_PREFIX = 'backup_';

  const META = {
    lastChange: 'siakad_last_change',
    lastBackup: 'siakad_last_backup',
    autoBackup: 'siakad_auto_backup',
    keepHistory: 'siakad_backup_keep'
  };

  // Kunci data aplikasi. Kunci UI (active_page, auth, dsb.) sengaja dikecualikan.
  const DATA_KEYS = new Set([
    'academic_year', 'academic_semester',
    'school_name', 'school_email', 'school_phone', 'school_logo',
    'app_theme', 'storage_mode', 'supabase_url', 'supabase_key',
    'siakad_guru_list', 'siakad_siswa_list', 'siakad_jadwal_list',
    'siakad_absensi_list', 'siakad_nilai_list', 'siakad_jurnal_list',
    'master_kelas', 'master_mapel', 'master_kepegawaian', 'master_jurusan'
  ]);

  const state = {
    dirHandle: null,
    connected: false,
    permission: 'unknown',
    dirty: false,
    autoBackup: true,
    keepHistory: 10,
    timer: null,
    restoring: false,
    ready: false
  };

  /* ------------------------------------------------------------------ */
  /* INDEXEDDB — menyimpan FileSystemDirectoryHandle                      */
  /* ------------------------------------------------------------------ */
  function openDB() {
    return new Promise((resolve, reject) => {
      if (!global.indexedDB) return reject(new Error('IndexedDB tidak tersedia'));
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(DB_STORE)) {
          request.result.createObjectStore(DB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function idbGet(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const request = tx.objectStore(DB_STORE).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  }

  async function idbSet(key, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(value, key);
      tx.oncomplete = () => { db.close(); resolve(value); };
      tx.onerror = () => reject(tx.error);
    });
  }

  async function idbDelete(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).delete(key);
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = () => reject(tx.error);
    });
  }

  /* ------------------------------------------------------------------ */
  /* HELPERS                                                             */
  /* ------------------------------------------------------------------ */
  const nativeSetItem = Storage.prototype.setItem;
  const nativeRemoveItem = Storage.prototype.removeItem;
  const nativeClear = Storage.prototype.clear;

  let suppressChanges = false;

  function isDataKey(key) {
    return DATA_KEYS.has(key) || key.startsWith('master_') || key.startsWith('siakad_');
  }

  function notify(message, type) {
    if (typeof global.showToast === 'function') global.showToast(message, type || 'success');
    else console.info('[StorageManager]', message);
  }

  function metaSet(key, value) {
    nativeSetItem.call(localStorage, key, String(value));
  }

  function metaGet(key) {
    return localStorage.getItem(key);
  }

  function fileStamp(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()) +
      '_' + pad(date.getHours()) + pad(date.getMinutes()) + pad(date.getSeconds());
  }

  function relativeTime(epoch) {
    if (!epoch) return 'Belum pernah';
    const diff = Date.now() - Number(epoch);
    if (diff < 60000) return 'Baru saja';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' menit lalu';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' jam lalu';
    return Math.floor(diff / 86400000) + ' hari lalu';
  }

  function looksLikeBackup(data) {
    return data && typeof data === 'object' &&
      (data.app_title === 'SIAKAD_BACKUP_DATABASE' || data.guru_list || data.siswa_list || data.master_data);
  }

  function isSupported() {
    return typeof global.showDirectoryPicker === 'function';
  }

  async function ensurePermission(handle, mode) {
    if (!handle || typeof handle.queryPermission !== 'function') return true;
    let result = await handle.queryPermission({ mode: mode || 'readwrite' });
    if (result !== 'granted' && typeof handle.requestPermission === 'function') {
      try { result = await handle.requestPermission({ mode: mode || 'readwrite' }); } catch (_) { /* dibatalkan user */ }
    }
    state.permission = result;
    return result === 'granted';
  }

  /* ------------------------------------------------------------------ */
  /* PATCH LOCALSTORAGE — auto backup setiap ada perubahan data           */
  /* ------------------------------------------------------------------ */
  function patchStorage() {
    Storage.prototype.setItem = function (key, value) {
      nativeSetItem.call(this, key, String(value));
      if (this === localStorage && !suppressChanges && isDataKey(key)) onDataChanged(key);
    };

    Storage.prototype.removeItem = function (key) {
      nativeRemoveItem.call(this, key);
      if (this === localStorage && !suppressChanges && isDataKey(key)) onDataChanged(key);
    };

    Storage.prototype.clear = function () {
      nativeClear.call(this);
      if (this === localStorage && !suppressChanges) onDataChanged('clear');
    };
  }

  function onDataChanged(key) {
    state.dirty = true;
    metaSet(META.lastChange, Date.now());
    updateUI();
    scheduleBackup();
  }

  function scheduleBackup() {
    if (!state.autoBackup) return;
    clearTimeout(state.timer);
    state.timer = setTimeout(() => backupNow({ reason: 'auto' }), 900);
  }

  /* ------------------------------------------------------------------ */
  /* BACKUP                                                              */
  /* ------------------------------------------------------------------ */
  async function backupNow(options) {
    const opts = options || {};
    if (!state.dirHandle) {
      updateUI();
      return { ok: false, reason: 'Belum ada folder yang terhubung.' };
    }
    if (!opts.force && !state.dirty) return { ok: true, skipped: true };
    if (!(await ensurePermission(state.dirHandle, 'readwrite'))) {
      updateUI();
      return { ok: false, reason: 'Izin folder perlu diberikan kembali.' };
    }
    if (typeof global.getCompleteBackupDataObject !== 'function') {
      return { ok: false, reason: 'Modul data belum siap.' };
    }

    suppressChanges = true;
    let payload;
    try {
      payload = global.getCompleteBackupDataObject();
    } finally {
      suppressChanges = false;
    }

    const now = Date.now();
    payload.meta = Object.assign({}, payload.meta, {
      app: 'SIAKAD SAGE',
      schema: 2,
      savedAt: now,
      savedAtISO: new Date(now).toISOString(),
      reason: opts.reason || 'manual'
    });

    const text = JSON.stringify(payload, null, 2);

    try {
      // File utama (selalu menjadi backup terbaru).
      const latest = await state.dirHandle.getFileHandle(LATEST_FILE, { create: true });
      const writable = await latest.createWritable();
      await writable.write(text);
      await writable.close();

      // Riwayat backup agar bisa kembali ke versi sebelumnya.
      const history = await state.dirHandle.getDirectoryHandle(HISTORY_DIR, { create: true });
      const historyFile = HISTORY_PREFIX + fileStamp(new Date(now)) + '.json';
      const archived = await history.getFileHandle(historyFile, { create: true });
      const archivedWritable = await archived.createWritable();
      await archivedWritable.write(text);
      await archivedWritable.close();

      await rotateHistory(history);

      metaSet(META.lastBackup, now);
      metaSet(META.lastChange, now);
      state.dirty = false;
      await refreshHistory();
      updateUI();

      if (opts.reason !== 'auto') notify('Backup otomatis berhasil disimpan ke folder Anda.', 'success');
      return { ok: true, time: now, file: LATEST_FILE };
    } catch (error) {
      console.error('[StorageManager] gagal backup:', error);
      updateUI();
      return { ok: false, reason: error.message || 'Gagal menulis file backup.' };
    }
  }

  async function rotateHistory(historyDir) {
    const entries = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const [name, entry] of historyDir.entries()) {
      if (entry.kind === 'file' && name.startsWith(HISTORY_PREFIX) && name.endsWith('.json')) {
        entries.push(name);
      }
    }
    entries.sort().reverse();
    const keep = Math.max(1, Math.min(50, state.keepHistory));
    for (let i = keep; i < entries.length; i += 1) {
      try { await historyDir.removeEntry(entries[i]); } catch (_) { /* abaikan */ }
    }
  }

  /* ------------------------------------------------------------------ */
  /* RESTORE                                                             */
  /* ------------------------------------------------------------------ */
  function applyBackupData(data, options) {
    const opts = options || {};
    const mode = opts.mode === 'merge' ? 'merge' : 'replace';

    function write(key, value, unique) {
      if (value === undefined || value === null) return;
      if (mode === 'merge' && Array.isArray(value)) {
        let current = [];
        try { current = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { current = []; }
        if (!Array.isArray(current)) current = [];
        const merged = unique ? mergeUnique(current.concat(value)) : mergeById(current.concat(value));
        nativeSetItem.call(localStorage, key, JSON.stringify(merged));
      } else {
        nativeSetItem.call(localStorage, key, JSON.stringify(value));
      }
    }

    function writeText(key, value) {
      if (value !== undefined && value !== null && value !== '') nativeSetItem.call(localStorage, key, String(value));
    }

    suppressChanges = true;
    try {
      write('siakad_guru_list', data.guru_list);
      write('siakad_siswa_list', data.siswa_list);
      write('siakad_jadwal_list', data.jadwal_list);
      write('siakad_absensi_list', data.absensi_list);
      write('siakad_nilai_list', data.nilai_list);
      write('siakad_jurnal_list', data.jurnal_list);

      if (data.master_data) {
        write('master_kelas', data.master_data.kelas, true);
        write('master_mapel', data.master_data.mapel, true);
        write('master_kepegawaian', data.master_data.kepegawaian, true);
        write('master_jurusan', data.master_data.jurusan, true);
      }
      if (data.academic_period) {
        writeText('academic_year', data.academic_period.year);
        writeText('academic_semester', data.academic_period.semester);
      }
      if (data.school_info) {
        writeText('school_name', data.school_info.name);
        writeText('school_email', data.school_info.email);
        writeText('school_phone', data.school_info.phone);
        writeText('school_logo', data.school_info.logo);
      }
      if (data.settings) {
        writeText('app_theme', data.settings.app_theme);
        writeText('storage_mode', data.settings.storage_mode);
        writeText('supabase_url', data.settings.supabase_url);
        writeText('supabase_key', data.settings.supabase_key);
      }
      metaSet(META.lastChange, Number(data.meta && data.meta.savedAt) || Date.now());
    } finally {
      suppressChanges = false;
    }

    if (!opts.skipBackup) scheduleBackup();
    return true;
  }

  function mergeById(items) {
    const map = new Map();
    items.forEach((item) => {
      const key = (item && (item.id || item.nisn || item.nip || item.nuptk)) || JSON.stringify(item);
      map.set(String(key), item);
    });
    return Array.from(map.values());
  }

  function mergeUnique(items) {
    return Array.from(new Set(items.map((item) => String(item))));
  }

  async function readJSONFromFile(fileHandle) {
    const file = await fileHandle.getFile();
    return JSON.parse(await file.text());
  }

  async function autoRestore(options) {
    const opts = options || {};
    if (!state.dirHandle) return { ok: false, reason: 'Belum ada folder yang terhubung.' };
    if (!(await ensurePermission(state.dirHandle, 'readwrite'))) {
      updateUI();
      return { ok: false, reason: 'Izin folder perlu diberikan kembali.' };
    }

    let data;
    try {
      data = await readJSONFromFile(await state.dirHandle.getFileHandle(LATEST_FILE));
    } catch (_) {
      return { ok: false, reason: 'File backup otomatis belum ada di folder ini.' };
    }
    if (!looksLikeBackup(data)) return { ok: false, reason: 'File backup tidak dikenali.' };

    const backupTime = Number(data.meta && data.meta.savedAt) ||
      Date.parse(data.export_date || '') || 0;
    const localTime = Number(metaGet(META.lastChange) || 0);

    // Data lokal yang lebih baru menang (misal user input saat offline).
    if (backupTime <= localTime) {
      state.dirty = Boolean(localTime && localTime > Number(metaGet(META.lastBackup) || 0));
      updateUI();
      return { ok: true, restored: false, reason: 'Data lokal sudah lebih baru.', backupTime };
    }

    state.restoring = true;
    try {
      applyBackupData(data, { skipBackup: true });
      metaSet(META.lastBackup, backupTime);
      state.dirty = false;
      if (!opts.silent) notify('Data terbaru berhasil dipulihkan dari folder Anda.', 'success');
      return { ok: true, restored: true, time: backupTime };
    } finally {
      state.restoring = false;
      updateUI();
    }
  }

  async function listBackups() {
    if (!state.dirHandle) return [];
    if (!(await ensurePermission(state.dirHandle, 'readwrite'))) return [];
    try {
      const history = await state.dirHandle.getDirectoryHandle(HISTORY_DIR);
      const list = [];
      // eslint-disable-next-line no-restricted-syntax
      for await (const [name, entry] of history.entries()) {
        if (entry.kind === 'file' && name.startsWith(HISTORY_PREFIX) && name.endsWith('.json')) {
          const file = await entry.getFile();
          list.push({ name: name, size: file.size, modified: file.lastModified });
        }
      }
      return list.sort((a, b) => b.name.localeCompare(a.name)).slice(0, 30);
    } catch (_) {
      return [];
    }
  }

  async function restoreBackupFile(name) {
    if (!state.dirHandle) return { ok: false, reason: 'Folder belum terhubung.' };
    if (!(await ensurePermission(state.dirHandle, 'readwrite'))) return { ok: false, reason: 'Izin ditolak.' };
    try {
      const history = await state.dirHandle.getDirectoryHandle(HISTORY_DIR);
      const data = await readJSONFromFile(await history.getFileHandle(name));
      if (!looksLikeBackup(data)) return { ok: false, reason: 'File backup tidak dikenali.' };
      applyBackupData(data);
      notify('Backup "' + name + '" berhasil dipulihkan.', 'success');
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: error.message || 'Gagal memulihkan backup.' };
    }
  }

  async function deleteBackupFile(name) {
    if (!state.dirHandle) return false;
    try {
      const history = await state.dirHandle.getDirectoryHandle(HISTORY_DIR);
      await history.removeEntry(name);
      await refreshHistory();
      return true;
    } catch (_) {
      return false;
    }
  }

  async function refreshHistory() {
    const list = await listBackups();
    global.dispatchEvent(new CustomEvent('siakad:backup-history', { detail: list }));
    return list;
  }

  /* ------------------------------------------------------------------ */
  /* STATUS UI                                                           */
  /* ------------------------------------------------------------------ */
  function getStatus() {
    return {
      supported: isSupported(),
      connected: state.connected,
      permission: state.permission,
      folderName: state.dirHandle ? state.dirHandle.name : '',
      autoBackup: state.autoBackup,
      keepHistory: state.keepHistory,
      lastBackup: Number(metaGet(META.lastBackup) || 0),
      lastChange: Number(metaGet(META.lastChange) || 0),
      dirty: state.dirty,
      latestFile: LATEST_FILE,
      historyDir: HISTORY_DIR
    };
  }

  function updateUI() {
    const status = getStatus();
    global.dispatchEvent(new CustomEvent('siakad:backup-status', { detail: status }));

    let label;
    let tone;
    if (!status.supported) {
      label = 'Browser belum mendukung folder lokal';
      tone = 'warn';
    } else if (!status.connected) {
      label = 'Folder lokal belum terhubung';
      tone = 'warn';
    } else if (status.permission !== 'granted' && status.permission !== 'unknown') {
      label = 'Perlu izin folder kembali';
      tone = 'warn';
    } else if (status.dirty) {
      label = 'Ada perubahan, menunggu backup';
      tone = 'warn';
    } else {
      label = 'Tersimpan otomatis · ' + relativeTime(status.lastBackup);
      tone = 'ok';
    }

    const chip = document.getElementById('backupStatusText');
    if (chip) chip.textContent = label;
    const dot = document.getElementById('backupStatusDot');
    if (dot) dot.className = 'status-dot ' + tone;
    const dash = document.getElementById('dashBackupStatus');
    if (dash) dash.textContent = label;
    const folder = document.getElementById('folderStatusText');
    if (folder && status.connected) {
      folder.textContent = 'Terhubung ke folder "' + status.folderName + '" · Backup terakhir: ' + relativeTime(status.lastBackup);
    }
  }

  /* ------------------------------------------------------------------ */
  /* API PUBLIK                                                          */
  /* ------------------------------------------------------------------ */
  const api = {
    get ready() { return initPromise; },
    isSupported: isSupported,
    getStatus: getStatus,
    updateUI: updateUI,

    async connectFolder() {
      if (!isSupported()) {
        notify('Gunakan Chrome / Edge / Brave versi terbaru untuk fitur folder lokal.', 'error');
        return { ok: false, reason: 'Browser tidak mendukung showDirectoryPicker.' };
      }
      try {
        const handle = await global.showDirectoryPicker({ mode: 'readwrite' });
        await idbSet(HANDLE_KEY, handle);
        state.dirHandle = handle;
        state.connected = true;
        state.permission = 'granted';
        state.dirty = true;
        const result = await backupNow({ force: true, reason: 'connect' });
        await refreshHistory();
        updateUI();
        if (result.ok) notify('Folder "' + handle.name + '" terhubung. Backup otomatis aktif!', 'success');
        return result;
      } catch (error) {
        if (error && error.name === 'AbortError') return { ok: false, reason: 'Pemilihan folder dibatalkan.' };
        return { ok: false, reason: error.message || 'Gagal menghubungkan folder.' };
      }
    },

    async disconnectFolder() {
      await idbDelete(HANDLE_KEY);
      state.dirHandle = null;
      state.connected = false;
      state.permission = 'unknown';
      const folder = document.getElementById('folderStatusText');
      if (folder) folder.textContent = 'Belum ada folder yang terhubung.';
      updateUI();
      notify('Folder lokal diputus. Data tetap tersimpan di browser.', 'info');
      return { ok: true };
    },

    async requestAccess() {
      if (!state.dirHandle) return { ok: false, reason: 'Folder belum pernah dipilih.' };
      const granted = await ensurePermission(state.dirHandle, 'readwrite');
      updateUI();
      if (granted) notify('Akses folder berhasil dipulihkan.', 'success');
      return { ok: granted };
    },

    backupNow: backupNow,
    autoRestore: autoRestore,
    applyBackupData: applyBackupData,

    // Jalankan perubahan tanpa memicu auto backup (dipakai saat reset database).
    withoutBackup(fn) {
      suppressChanges = true;
      try { return fn(); } finally { suppressChanges = false; }
    },

    // Tandai data lokal sebagai sudah terbaru tanpa menulis file backup.
    markClean() {
      clearTimeout(state.timer);
      const now = Date.now();
      metaSet(META.lastChange, now);
      metaSet(META.lastBackup, now);
      state.dirty = false;
      updateUI();
    },

    listBackups: listBackups,
    refreshHistory: refreshHistory,
    restoreBackupFile: restoreBackupFile,
    deleteBackupFile: deleteBackupFile,

    setAutoBackup(enabled) {
      state.autoBackup = Boolean(enabled);
      metaSet(META.autoBackup, state.autoBackup ? '1' : '0');
      if (state.autoBackup && state.dirty) scheduleBackup();
      updateUI();
      notify(state.autoBackup ? 'Auto backup diaktifkan.' : 'Auto backup dinonaktifkan.', 'info');
    },

    setKeepHistory(count) {
      state.keepHistory = Math.max(1, Math.min(50, Number(count) || 10));
      metaSet(META.keepHistory, state.keepHistory);
      updateUI();
    }
  };

  let initPromise = (async function init() {
    state.autoBackup = metaGet(META.autoBackup) !== '0';
    state.keepHistory = Number(metaGet(META.keepHistory)) || 10;

    patchStorage();

    try {
      const handle = await idbGet(HANDLE_KEY);
      if (handle) {
        state.dirHandle = handle;
        state.connected = true;
        state.permission = typeof handle.queryPermission === 'function'
          ? await handle.queryPermission({ mode: 'readwrite' })
          : 'granted';
      }
    } catch (error) {
      console.warn('[StorageManager] gagal memuat handle folder:', error);
    }

    updateUI();
    state.ready = true;

    // Pulihkan otomatis dari folder hanya jika file backup lebih baru dari data lokal.
    if (state.connected && state.permission === 'granted') {
      const result = await autoRestore({ silent: true });
      if (result.restored) notify('Database terbaru berhasil dipulihkan dari folder lokal.', 'success');
    }
    await refreshHistory();
    return api.getStatus();
  })();

  global.StorageManager = api;
})(window);
