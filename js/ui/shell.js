/* ==========================================================================
 * SIAKAD SAGE — UI SHELL
 * Sidebar responsif, header status backup, panel pengaturan penyimpanan,
 * riwayat backup, dan sinkronisasi tema.
 * ========================================================================== */
(function (global) {
  'use strict';

  const SIDEBAR_KEY = 'siakad_sidebar_collapsed';
  const THEMES = ['sage', 'navy', 'emerald', 'monochrome', 'amber', 'dark', 'blue', 'teal'];

  const NAV_GROUPS = [
    { label: 'Ringkasan', before: 'dashboard' },
    { label: 'Peserta Didik', before: 'siswa' },
    { label: 'Akademik', before: 'guru' },
    { label: 'Sistem', before: 'masterdata' }
  ];

  const ICONS = {
    menu: '<svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    chevron: '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>',
    backup: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };

  function escapeHTML(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function formatSize(bytes) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function formatTime(epoch) {
    if (!epoch) return '-';
    return new Date(Number(epoch)).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  /* ---------------------- SIDEBAR ---------------------- */
  function buildSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    if (!sidebar) return;

    NAV_GROUPS.forEach((group) => {
      const target = sidebar.querySelector('.nav-item[data-page="' + group.before + '"]');
      if (!target || target.previousElementSibling && target.previousElementSibling.classList.contains('nav-section-label')) return;
      const label = document.createElement('div');
      label.className = 'nav-section-label';
      label.textContent = group.label;
      sidebar.insertBefore(label, target);
    });

    let toggle = sidebar.querySelector('.sidebar-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'sidebar-toggle';
      toggle.title = 'Perbesar / perkecil menu';
      toggle.setAttribute('aria-label', 'Perbesar atau perkecil menu');
      toggle.innerHTML = ICONS.chevron;
      const brand = sidebar.querySelector('.brand-header');
      if (brand) brand.appendChild(toggle);
    }

    const collapsed = localStorage.getItem(SIDEBAR_KEY) === '1' || window.innerWidth < 900;
    applySidebarState(collapsed);

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      applySidebarState(!sidebar.classList.contains('collapsed'));
    });

    sidebar.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        if (window.innerWidth < 900) closeMobileSidebar();
      });
    });
  }

  function applySidebarState(collapsed) {
    const sidebar = document.getElementById('mainSidebar');
    if (!sidebar) return;
    sidebar.classList.toggle('collapsed', Boolean(collapsed));
    localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
  }

  function buildMobileControls() {
    const header = document.querySelector('.top-header');
    if (!header || header.querySelector('.mobile-menu-btn')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-menu-btn';
    button.setAttribute('aria-label', 'Buka menu');
    button.innerHTML = ICONS.menu;
    button.addEventListener('click', openMobileSidebar);
    header.insertBefore(button, header.firstChild);

    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    backdrop.id = 'sidebarBackdrop';
    backdrop.addEventListener('click', closeMobileSidebar);
    document.body.appendChild(backdrop);
  }

  function openMobileSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('visible');
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('visible');
  }

  /* ---------------------- HEADER ---------------------- */
  function buildHeaderBackupChip() {
    const group = document.querySelector('.header-right-group');
    if (!group || group.querySelector('.backup-chip')) return;

    const chip = document.createElement('div');
    chip.className = 'backup-chip';
    chip.innerHTML =
      '<span class="status-dot warn" id="backupStatusDot"></span>' +
      '<span class="backup-chip-text" id="backupStatusText">Memeriksa status penyimpanan...</span>' +
      '<button type="button" class="backup-chip-btn" title="Backup sekarang" onclick="Shell.quickBackup()">' + ICONS.backup + '</button>';
    group.insertBefore(chip, group.firstChild);
  }

  /* ---------------------- THEMA ---------------------- */
  function applyTheme(theme) {
    const selected = THEMES.indexOf(theme) >= 0 ? theme : 'sage';
    document.documentElement.setAttribute('data-theme', selected);
    if (localStorage.getItem('app_theme') !== selected) localStorage.setItem('app_theme', selected);
    document.querySelectorAll('.theme-card').forEach((card) => {
      card.classList.toggle('active', card.getAttribute('data-theme-name') === selected);
    });
  }

  /* ---------------------- PENGATURAN ---------------------- */
  function renderStorageSettings(status) {
    const s = status || (global.StorageManager && global.StorageManager.getStatus());
    if (!s) return;

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText('storageFolderName', s.connected ? s.folderName : '-');
    setText('storageLastBackup', formatTime(s.lastBackup));
    setText('storageLastChange', formatTime(s.lastChange));
    setText('storagePermission', s.permission === 'granted' ? 'Izin aktif' :
      s.permission === 'prompt' ? 'Perlu persetujuan' :
        s.permission === 'denied' ? 'Izin ditolak' : '-');
    setText('storageEngine', s.connected ? 'Folder lokal + browser' : 'Browser lokal');

    const autoToggle = document.getElementById('autoBackupToggle');
    if (autoToggle) autoToggle.checked = s.autoBackup;
    const keepSelect = document.getElementById('keepHistorySelect');
    if (keepSelect) keepSelect.value = String(s.keepHistory);

    const folderCard = document.getElementById('folderCard');
    if (folderCard) folderCard.classList.toggle('is-connected', s.connected);

    const connectBtn = document.getElementById('connectFolderBtn');
    if (connectBtn) connectBtn.textContent = s.connected ? 'Ganti Folder Penyimpanan' : 'Pilih Folder di Komputer';
    const accessBtn = document.getElementById('requestAccessBtn');
    if (accessBtn) accessBtn.style.display = s.connected && s.permission !== 'granted' ? '' : 'none';
    const disconnectBtn = document.getElementById('disconnectFolderBtn');
    if (disconnectBtn) disconnectBtn.style.display = s.connected ? '' : 'none';
  }

  async function renderBackupHistory(list) {
    const container = document.getElementById('backupHistoryList');
    if (!container) return;

    if (!list || !list.length) {
      container.innerHTML = '<div class="empty-state">Belum ada riwayat backup. Hubungkan folder lalu simpan perubahan data.</div>';
      return;
    }

    container.innerHTML = list.map((item) => {
      const safeName = escapeHTML(item.name);
      const encoded = encodeURIComponent(item.name);
      return '<div class="history-row">' +
        '<div class="history-icon">' + ICONS.backup + '</div>' +
        '<div class="history-meta">' +
        '<strong>' + safeName + '</strong>' +
        '<span>' + formatTime(item.modified) + ' · ' + formatSize(item.size) + '</span>' +
        '</div>' +
        '<div class="history-actions">' +
        '<button type="button" class="btn btn-secondary btn-xs" onclick="Shell.restoreBackup(decodeURIComponent(\'' + encoded + '\'))">Pulihkan</button>' +
        '<button type="button" class="btn btn-ghost btn-xs" onclick="Shell.deleteBackup(decodeURIComponent(\'' + encoded + '\'))">Hapus</button>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  async function quickBackup() {
    if (!global.StorageManager) return;
    const status = global.StorageManager.getStatus();
    if (!status.connected) {
      if (global.showToast) global.showToast('Hubungkan folder lokal terlebih dahulu di Pengaturan.', 'info');
      return;
    }
    const result = await global.StorageManager.backupNow({ force: true, reason: 'manual' });
    if (!result.ok && global.showToast) global.showToast(result.reason, 'error');
  }

  async function selectFolder() {
    if (!global.StorageManager) return;
    const result = await global.StorageManager.connectFolder();
    if (!result.ok && global.showToast && result.reason) global.showToast(result.reason, 'error');
  }

  async function restoreLatest() {
    if (!global.StorageManager) return;
    const result = await global.StorageManager.autoRestore({ silent: false });
    if (!result.ok && global.showToast) global.showToast(result.reason, 'error');
    if (result.ok && !result.restored && global.showToast) global.showToast(result.reason || 'Data lokal sudah lebih baru.', 'info');
  }

  async function restoreBackup(name) {
    if (!global.StorageManager) return;
    if (!global.confirm('Pulihkan backup "' + name + '"? Data saat ini akan ditimpa.')) return;
    const result = await global.StorageManager.restoreBackupFile(name);
    if (!result.ok && global.showToast) global.showToast(result.reason, 'error');
    else if (result.ok && typeof global.loadPage === 'function') global.loadPage('pengaturan');
  }

  async function deleteBackup(name) {
    if (!global.StorageManager) return;
    if (!global.confirm('Hapus file backup "' + name + '" dari folder?')) return;
    const ok = await global.StorageManager.deleteBackupFile(name);
    if (global.showToast) global.showToast(ok ? 'Backup dihapus.' : 'Gagal menghapus backup.', ok ? 'success' : 'error');
  }

  function bindEvents() {
    global.addEventListener('siakad:backup-status', (event) => renderStorageSettings(event.detail));
    global.addEventListener('siakad:backup-history', (event) => renderBackupHistory(event.detail));

    const autoToggle = document.getElementById('autoBackupToggle');
    if (autoToggle) {
      autoToggle.addEventListener('change', () => {
        if (global.StorageManager) global.StorageManager.setAutoBackup(autoToggle.checked);
      });
    }
    const keepSelect = document.getElementById('keepHistorySelect');
    if (keepSelect) {
      keepSelect.addEventListener('change', () => {
        if (global.StorageManager) global.StorageManager.setKeepHistory(keepSelect.value);
      });
    }

    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        applySidebarState(!document.getElementById('mainSidebar').classList.contains('collapsed'));
      }
    });
  }

  const Shell = {
    init: function () {
      applyTheme(localStorage.getItem('app_theme') || 'sage');
      buildSidebar();
      buildMobileControls();
      buildHeaderBackupChip();
      bindEvents();
      if (global.StorageManager) {
        renderStorageSettings(global.StorageManager.getStatus());
        global.StorageManager.refreshHistory();
      }
    },
    applyTheme: applyTheme,
    renderStorageSettings: renderStorageSettings,
    renderBackupHistory: renderBackupHistory,
    quickBackup: quickBackup,
    selectFolder: selectFolder,
    restoreLatest: restoreLatest,
    restoreBackup: restoreBackup,
    deleteBackup: deleteBackup,
    setSidebar: applySidebarState,
    openMobileSidebar: openMobileSidebar,
    closeMobileSidebar: closeMobileSidebar
  };

  global.Shell = Shell;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Shell.init);
  } else {
    Shell.init();
  }
})(window);
