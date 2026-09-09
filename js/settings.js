// MANAJEMEN MASTER DATA, GURU, SISWA 8355, JADWAL, PRESENSI, KARTU SISWA, BACKUP/RESTORE, FOLDER ACCESS, ENGINE TEMA & SHEETJS EXCEL

// ===================================================
// 1. TOAST NOTIFICATION ENGINE (MELAYANG)
// ===================================================
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      display: flex; flex-direction: column; gap: 10px; max-width: 360px;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6';
  toast.style.cssText = `
    background: ${bgColor}; color: #FFFFFF; padding: 12px 18px; border-radius: 8px;
    font-size: 13px; font-weight: 600; box-shadow: 0 4px 14px rgba(0,0,0,0.15);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    animation: slideInRight 0.3s ease-out; opacity: 1; transition: all 0.3s ease;
  `;
  
  toast.innerHTML = `<span>${message}</span><span style="cursor:pointer; font-size:16px;" onclick="this.parentElement.remove()">×</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ===================================================
// 2. PENGATURAN TAHUN AJARAN & SEMESTER (UPDATABLE)
// ===================================================
function getAcademicPeriod() {
  const year = localStorage.getItem('academic_year') || '2026/2027';
  const semester = localStorage.getItem('academic_semester') || 'Ganjil';
  return { year, semester };
}

function saveAcademicPeriod(e) {
  if (e) e.preventDefault();
  const yearInput = document.getElementById('inputTahunAjaran').value.trim();
  const semesterInput = document.getElementById('selectSemester').value;

  if (yearInput) {
    localStorage.setItem('academic_year', yearInput);
    localStorage.setItem('academic_semester', semesterInput);
    updateAcademicPeriodUI();
    saveAutoBackupToFolder();
    showToast(`Tahun Ajaran diperbarui: ${yearInput} (${semesterInput})`, 'success');
  }
}

function updateAcademicPeriodUI() {
  const { year, semester } = getAcademicPeriod();
  
  const displayEl = document.getElementById('displayAcademicPeriod');
  if (displayEl) displayEl.innerText = `TA ${year} - ${semester}`;

  const inputYear = document.getElementById('inputTahunAjaran');
  const selectSem = document.getElementById('selectSemester');
  if (inputYear) inputYear.value = year;
  if (selectSem) selectSem.value = semester;
}

// ===================================================
// 3. LIVE SEARCH BAR ENGINE (GURU & SISWA)
// ===================================================
function searchGuruTable(query) {
  const filter = query.toLowerCase();
  const rows = document.querySelectorAll('#tableGuruBody tr');
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
}

function searchSiswaTable(query) {
  const filter = query.toLowerCase();
  const rows = document.querySelectorAll('#tableSiswaBody tr');
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
}

// ===================================================
// 4. EXPORT REKAP PRESENSI BULANAN TO EXCEL (.XLSX)
// ===================================================
function exportPresensiBulananExcel() {
  if (typeof XLSX === 'undefined') {
    alert('Library SheetJS belum siap!');
    return;
  }

  const absensiList = getAbsensiData();
  const siswaList = getSiswaData();
  const selectKelas = document.getElementById('selectAbsensiKelas');
  const selectedKelas = selectKelas ? selectKelas.value : '';

  if (!selectedKelas) {
    alert('Silakan pilih Rombongan Belajar (Kelas) terlebih dahulu!');
    return;
  }

  const classSiswa = siswaList.filter(s => s.kelas === selectedKelas);
  if (classSiswa.length === 0) {
    alert(`Tidak ada siswa di kelas ${selectedKelas}`);
    return;
  }

  const exportData = classSiswa.map((s, idx) => {
    let hadir = 0, sakit = 0, izin = 0, alpa = 0;
    
    absensiList.filter(a => a.kelas === selectedKelas).forEach(rec => {
      if (rec.details) {
        const match = rec.details.find(d => d.siswaId === s.id);
        if (match) {
          if (match.status === 'H') hadir++;
          if (match.status === 'S') sakit++;
          if (match.status === 'I') izin++;
          if (match.status === 'A') alpa++;
        }
      }
    });

    const totalHari = hadir + sakit + izin + alpa;
    const persentase = totalHari > 0 ? Math.round((hadir / totalHari) * 100) + '%' : '0%';

    return {
      "No": idx + 1,
      "NISN": s.nisn,
      "NIS": s.nis,
      "Nama Siswa": s.nama,
      "Kelas": s.kelas,
      "Hadir (H)": hadir,
      "Sakit (S)": sakit,
      "Izin (I)": izin,
      "Alpa (A)": alpa,
      "Persentase Kehadiran": persentase
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Rekap_${selectedKelas}`);
  XLSX.writeFile(wb, `REKAP_PRESENSI_KELAS_${selectedKelas.replace(/\s+/g, '_')}.xlsx`);
  
  showToast(`Rekap presensi kelas ${selectedKelas} berhasil diunduh!`, 'success');
}

// ===================================================
// 5. GRAFIK VISUAL KEHADIRAN (SVG CHART RENDERER)
// ===================================================
function renderAttendanceChartSVG() {
  const chartBox = document.getElementById('dashAttendanceChart');
  if (!chartBox) return;

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const absensiList = getAbsensiData();

  const chartData = days.map(day => {
    let totalHadir = 0;
    let totalSiswa = 0;

    absensiList.forEach(rec => {
      const recDay = new Date(rec.tanggal).toLocaleDateString('id-ID', { weekday: 'long' });
      if (recDay.toLowerCase() === day.toLowerCase() && rec.details) {
        rec.details.forEach(d => {
          totalSiswa++;
          if (d.status === 'H') totalHadir++;
        });
      }
    });

    const percent = totalSiswa > 0 ? Math.round((totalHadir / totalSiswa) * 100) : 0;
    return { day, percent };
  });

  let svgBars = '';
  chartData.forEach((d, i) => {
    const barHeight = Math.max((d.percent / 100) * 120, 8);
    const x = 35 + i * 50;
    const y = 140 - barHeight;

    svgBars += `
      <rect x="${x}" y="${y}" width="28" height="${barHeight}" rx="4" fill="var(--primary)" opacity="0.85" />
      <text x="${x + 14}" y="${y - 6}" font-size="10" font-weight="700" fill="var(--text-main)" text-anchor="middle">${d.percent}%</text>
      <text x="${x + 14}" y="158" font-size="11" font-weight="600" fill="var(--text-muted)" text-anchor="middle">${d.day.substring(0, 3)}</text>
    `;
  });

  chartBox.innerHTML = `
    <svg viewBox="0 0 340 170" style="width: 100%; height: 170px; font-family: inherit;">
      <line x1="20" y1="140" x2="330" y2="140" stroke="var(--border-color)" stroke-width="1"/>
      ${svgBars}
    </svg>
  `;
}

// ===================================================
// DYNAMIC THEME ENGINE (LIVE INTERACTIVE PREVIEW)
// ===================================================
const themeStyles = {
  sage: `
    :root, [data-theme="sage"] {
      --primary: #2E4F4F;
      --primary-hover: #0E2F2F;
      --accent-soft: #E8F1F1;
      --bg-main: #F4F6F4;
      --card-bg: #FFFFFF;
      --input-bg: #F8FAFA;
      --border-color: #E2E8E8;
      --text-main: #1C2826;
      --text-muted: #6B7C7C;
      --sidebar-bg: #1F3333;
    }
  `,
  navy: `
    :root, [data-theme="navy"] {
      --primary: #1E293B;
      --primary-hover: #0F172A;
      --accent-soft: #E2E8F0;
      --bg-main: #F1F5F9;
      --card-bg: #FFFFFF;
      --input-bg: #F8FAFC;
      --border-color: #CBD5E1;
      --text-main: #0F172A;
      --text-muted: #64748B;
      --sidebar-bg: #0F172A;
    }
  `,
  emerald: `
    :root, [data-theme="emerald"] {
      --primary: #065F46;
      --primary-hover: #044E3A;
      --accent-soft: #D1FAE5;
      --bg-main: #ECFDF5;
      --card-bg: #FFFFFF;
      --input-bg: #F0FDF4;
      --border-color: #A7F3D0;
      --text-main: #064E3B;
      --text-muted: #059669;
      --sidebar-bg: #064E3B;
    }
  `,
  monochrome: `
    :root, [data-theme="monochrome"] {
      --primary: #18181B;
      --primary-hover: #09090B;
      --accent-soft: #E4E4E7;
      --bg-main: #F4F4F5;
      --card-bg: #FFFFFF;
      --input-bg: #FAFAFA;
      --border-color: #E4E4E7;
      --text-main: #09090B;
      --text-muted: #71717A;
      --sidebar-bg: #09090B;
    }
  `,
  amber: `
    :root, [data-theme="amber"] {
      --primary: #78350F;
      --primary-hover: #451A03;
      --accent-soft: #FEF3C7;
      --bg-main: #FFFBEB;
      --card-bg: #FFFFFF;
      --input-bg: #FFFDF5;
      --border-color: #FDE68A;
      --text-main: #451A03;
      --text-muted: #B45309;
      --sidebar-bg: #451A03;
    }
  `
};

function setTheme(themeName) {
  const selectedTheme = themeStyles[themeName] ? themeName : 'sage';
  
  let styleEl = document.getElementById('dynamicThemeStyle');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamicThemeStyle';
    document.head.appendChild(styleEl);
  }
  styleEl.innerHTML = themeStyles[selectedTheme];

  document.documentElement.setAttribute('data-theme', selectedTheme);
  localStorage.setItem('app_theme', selectedTheme);

  document.querySelectorAll('.theme-card').forEach(card => card.classList.remove('active'));
  const activeCard = document.querySelector(`.theme-card[data-theme-name="${selectedTheme}"]`);
  if (activeCard) activeCard.classList.add('active');
}

// ===================================================
// ACCESS FOLDER HARDDISK LOKAL & PROTEKSI ANTI-HAPUS
// ===================================================
let globalDirHandle = null;

async function selectLocalDirectory() {
  try {
    if ('showDirectoryPicker' in window) {
      globalDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      document.getElementById('folderStatusText').innerText = `✅ Terhubung ke Folder: "${globalDirHandle.name}"`;
      document.getElementById('folderStatusText').style.color = 'var(--primary)';
      alert(`Folder "${globalDirHandle.name}" berhasil terhubung! Database akan otomatis disinkronkan ke folder ini.`);
      saveAutoBackupToFolder();
    } else {
      alert('Browser ini belum mendukung akses folder langsung. Gunakan Google Chrome, Microsoft Edge, atau Brave versi terbaru.');
    }
  } catch (err) {
    console.warn('Akses folder dibatalkan:', err);
  }
}

async function saveAutoBackupToFolder() {
  if (!globalDirHandle) return;
  try {
    const backupData = JSON.stringify(getCompleteBackupDataObject(), null, 2);
    const fileHandle = await globalDirHandle.getFileHandle('DATABASE_SIAKAD_AUTOSAVE.json', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(backupData);
    await writable.close();
  } catch (err) {
    console.error('Gagal otomatis menyimpan ke folder:', err);
  }
}

async function enablePersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    const statusEl = document.getElementById('persistenceStatus');
    if (statusEl) {
      if (isPersisted) {
        statusEl.innerText = "🔒 Status: SANGAT AMAN (Kuncian Aktif, Kebal Clear Cache)";
        statusEl.style.color = "var(--primary)";
        alert('Proteksi Aktif! Browser telah mengunci data SIAKAD agar tidak terhapus saat pembersihan otomatis.');
      } else {
        statusEl.innerText = "⚠️ Status: Standar Browser (Belum Dikunci)";
        statusEl.style.color = "#EF4444";
      }
    }
  } else {
    alert('Browser ini tidak mendukung fitur Storage Lock.');
  }
}

async function checkStoragePersistence() {
  if (navigator.storage && navigator.storage.persisted) {
    const isPersisted = await navigator.storage.persisted();
    const statusEl = document.getElementById('persistenceStatus');
    if (statusEl) {
      if (isPersisted) {
        statusEl.innerText = "🔒 Status: SANGAT AMAN (Kuncian Aktif, Kebal Clear Cache)";
        statusEl.style.color = "var(--primary)";
      } else {
        statusEl.innerText = "⚠️ Status: Standar Browser (Klik Tombol di Bawah)";
        statusEl.style.color = "#EF4444";
      }
    }
  }
}

// ===================================================
// BACKUP & RESTORE JSON FILE
// ===================================================
function getCompleteBackupDataObject() {
  return {
    app_title: "SIAKAD_BACKUP_DATABASE",
    version: "1.0",
    export_date: new Date().toLocaleString('id-ID'),
    academic_period: getAcademicPeriod(),
    school_info: {
      name: localStorage.getItem('school_name') || '',
      email: localStorage.getItem('school_email') || '',
      phone: localStorage.getItem('school_phone') || '',
      logo: localStorage.getItem('school_logo') || ''
    },
    settings: {
      app_theme: localStorage.getItem('app_theme') || 'sage',
      storage_mode: localStorage.getItem('storage_mode') || 'local',
      supabase_url: localStorage.getItem('supabase_url') || '',
      supabase_key: localStorage.getItem('supabase_key') || ''
    },
    master_data: {
      kelas: getMasterData('kelas'),
      mapel: getMasterData('mapel'),
      kepegawaian: getMasterData('kepegawaian'),
      jurusan: getMasterData('jurusan')
    },
    guru_list: getGuruData(),
    siswa_list: getSiswaData(),
    jadwal_list: getJadwalData(),
    absensi_list: getAbsensiData()
  };
}

function exportDatabaseJSON() {
  const backupData = getCompleteBackupDataObject();
  const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const downloadAnchor = document.createElement('a');
  
  const today = new Date();
  const dateStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, '0') + "-" + String(today.getDate()).padStart(2, '0');
  
  downloadAnchor.setAttribute("href", jsonString);
  downloadAnchor.setAttribute("download", `BACKUP_SIAKAD_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  alert('Backup database berhasil diunduh!');
}

function importDatabaseJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!confirm('PERINGATAN!\n\nMengimpor file backup ini akan memperbarui dan menimpa database saat ini.\nApakah Abah yakin ingin melanjutkan?')) {
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);

      if (data.guru_list) localStorage.setItem('siakad_guru_list', JSON.stringify(data.guru_list));
      if (data.siswa_list) localStorage.setItem('siakad_siswa_list', JSON.stringify(data.siswa_list));
      if (data.jadwal_list) localStorage.setItem('siakad_jadwal_list', JSON.stringify(data.jadwal_list));
      if (data.absensi_list) localStorage.setItem('siakad_absensi_list', JSON.stringify(data.absensi_list));
      
      if (data.academic_period) {
        if (data.academic_period.year) localStorage.setItem('academic_year', data.academic_period.year);
        if (data.academic_period.semester) localStorage.setItem('academic_semester', data.academic_period.semester);
      }

      if (data.master_data) {
        if (data.master_data.kelas) localStorage.setItem('master_kelas', JSON.stringify(data.master_data.kelas));
        if (data.master_data.mapel) localStorage.setItem('master_mapel', JSON.stringify(data.master_data.mapel));
        if (data.master_data.kepegawaian) localStorage.setItem('master_kepegawaian', JSON.stringify(data.master_data.kepegawaian));
        if (data.master_data.jurusan) localStorage.setItem('master_jurusan', JSON.stringify(data.master_data.jurusan));
      }

      if (data.school_info) {
        if (data.school_info.name) localStorage.setItem('school_name', data.school_info.name);
        if (data.school_info.email) localStorage.setItem('school_email', data.school_info.email);
        if (data.school_info.phone) localStorage.setItem('school_phone', data.school_info.phone);
        if (data.school_info.logo) localStorage.setItem('school_logo', data.school_info.logo);
      }

      if (data.settings) {
        if (data.settings.app_theme) localStorage.setItem('app_theme', data.settings.app_theme);
        if (data.settings.storage_mode) localStorage.setItem('storage_mode', data.settings.storage_mode);
        if (data.settings.supabase_url) localStorage.setItem('supabase_url', data.settings.supabase_url);
        if (data.settings.supabase_key) localStorage.setItem('supabase_key', data.settings.supabase_key);
      }

      alert('RESTORE BERHASIL! 🎉\nDatabase berhasil dimuat ulang. Aplikasi akan melakukan Refresh.');
      window.location.reload();
    } catch (err) {
      alert('Gagal merestore database! Pastikan file berformat .json backup resmi SIAKAD.');
    }
  };
  reader.readAsText(file);
}

function resetDatabaseToDefault() {
  if (confirm('APAKAH ABAH BENAR-BENAR YAKIN?\n\nSemua data guru, siswa, master data, dan logo akan dihapus secara permanen dari browser ini.')) {
    localStorage.clear();
    alert('Database telah dibersihkan sepenuhnya!');
    window.location.reload();
  }
}

function toggleStorageModeUI() {
  const modeSelect = document.getElementById('selectStorageMode');
  const supabaseBox = document.getElementById('supabaseConfigContainer');
  if (!modeSelect || !supabaseBox) return;

  const selectedMode = modeSelect.value;
  localStorage.setItem('storage_mode', selectedMode);

  if (selectedMode === 'supabase') {
    supabaseBox.style.display = 'block';
  } else {
    supabaseBox.style.display = 'none';
  }
}

// ADAPTOR HYBRID STORAGE (LOCAL & SUPABASE CLOUD)
const DB = {
  isSupabaseActive() {
    const mode = localStorage.getItem('storage_mode') || 'local';
    const url = localStorage.getItem('supabase_url');
    const key = localStorage.getItem('supabase_key');
    return mode === 'supabase' && Boolean(url && key && window.supabase);
  },

  getClient() {
    if (this.isSupabaseActive()) {
      const url = localStorage.getItem('supabase_url');
      const key = localStorage.getItem('supabase_key');
      return window.supabase.createClient(url, key);
    }
    return null;
  },

  async migrateLocalToSupabase() {
    if (!this.isSupabaseActive()) {
      alert('Silakan aktifkan Mode Supabase dan simpan URL & Anon Key terlebih dahulu!');
      return;
    }

    try {
      const client = this.getClient();
      const keys = ['siakad_guru_list', 'siakad_siswa_list', 'master_kelas', 'master_mapel', 'siakad_jadwal_list', 'siakad_absensi_list'];

      for (const key of keys) {
        const localData = localStorage.getItem(key);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            await client.from(key).upsert(parsed);
          }
        }
      }
      alert('Berhasil! Data lokal berhasil diunggah dan disinkronkan ke Supabase Cloud 🎉');
    } catch (err) {
      alert('Gagal migrasi data ke Supabase: ' + err.message);
    }
  }
};

function saveSupabaseConfig() {
  const url = document.getElementById('inputSupabaseUrl').value.trim();
  const key = document.getElementById('inputSupabaseKey').value.trim();

  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);

  if (url && key) {
    alert('Koneksi Supabase berhasil disimpan!');
  } else {
    alert('Kredensial dikosongkan. Kembali ke Mode Lokal.');
  }
}

// ===================================================
// EXCEL IMPORT & EXPORT ENGINE (SHEETJS .XLSX)
// ===================================================

function downloadGuruExcelTemplate() {
  if (typeof XLSX === 'undefined') {
    alert('Library SheetJS belum siap! Periksa koneksi internet atau script pada index.html.');
    return;
  }

  const data = [{
    "Nama Lengkap": "Dr. Ahmad Fauzi, M.Pd.",
    "NIP": "198203152010011002",
    "NUPTK": "1234567890123456",
    "Tempat Lahir": "Pontianak",
    "Tanggal Lahir (YYYY-MM-DD)": "1982-09-15",
    "L/P": "L",
    "Agama": "Islam",
    "Ijazah Terakhir": "S2 Pendidikan",
    "Tahun Ijazah": "2010",
    "Mapel Utama": "Matematika Wajib",
    "Status Kepegawaian": "PNS / ASN",
    "Jabatan": "Guru Ahli Madya",
    "Pangkat Golongan": "Pembina / IV-a",
    "Sertifikasi": "Sudah",
    "No HP": "081234567890",
    "Email": "fauzi@sekolah.sch.id"
  }];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Master Guru");
  XLSX.writeFile(wb, "Template_Import_Guru.xlsx");
}

function importGuruExcel(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (typeof XLSX === 'undefined') {
    alert('Library SheetJS belum siap!');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      let list = getGuruData();
      let count = 0;

      jsonData.forEach((row, i) => {
        if (row["Nama Lengkap"]) {
          list.push({
            id: Date.now() + i,
            nama: String(row["Nama Lengkap"] || '').trim(),
            nip: String(row["NIP"] || '').trim(),
            nuptk: String(row["NUPTK"] || '').trim(),
            tempatLahir: String(row["Tempat Lahir"] || '').trim(),
            tglLahir: String(row["Tanggal Lahir (YYYY-MM-DD)"] || row["Tanggal Lahir"] || '').trim(),
            jk: String(row["L/P"] || 'L').trim(),
            agama: String(row["Agama"] || 'Islam').trim(),
            ijazah: String(row["Ijazah Terakhir"] || '').trim(),
            tahunIjazah: String(row["Tahun Ijazah"] || '').trim(),
            mapel: String(row["Mapel Utama"] || '').trim(),
            kepegawaian: String(row["Status Kepegawaian"] || '').trim(),
            jabatan: String(row["Jabatan"] || '').trim(),
            pangkatGol: String(row["Pangkat Golongan"] || '').trim(),
            sertifikasi: String(row["Sertifikasi"] || 'Belum').trim(),
            hp: String(row["No HP"] || '').trim(),
            email: String(row["Email"] || '').trim()
          });
          count++;
        }
      });

      localStorage.setItem('siakad_guru_list', JSON.stringify(list));
      renderGuruListUI();
      saveAutoBackupToFolder();
      alert(`Berhasil mengimpor ${count} data guru dari file Excel (.xlsx)!`);
    } catch (err) {
      alert("Gagal membaca file Excel! Pastikan file berformat .xlsx atau .xls.");
    }
  };
  reader.readAsArrayBuffer(file);
}

function downloadSiswaExcelTemplate() {
  if (typeof XLSX === 'undefined') {
    alert('Library SheetJS belum siap!');
    return;
  }

  const data = [{
    "Kelas": "X - A",
    "Jurusan": "IPA (Ilmu Pengetahuan Alam)",
    "NISN": "0051234567",
    "NIS": "23241001",
    "Nama Lengkap Siswa": "Aditya Pratama",
    "L/P": "L",
    "Agama": "Islam",
    "Tempat Lahir": "Jakarta",
    "Tanggal Lahir (YYYY-MM-DD)": "2008-04-12",
    "NIK": "3171000000000001",
    "No HP": "081299990000",
    "Nama Ayah": "Budi Pratama",
    "Nama Ibu": "Siti Rahma",
    "Pekerjaan Ortu": "PNS",
    "Alamat Lengkap": "Jl. Merdeka No. 12"
  }];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Biodata Siswa 8355");
  XLSX.writeFile(wb, "Template_Import_Siswa_8355.xlsx");
}

function importSiswaExcel(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (typeof XLSX === 'undefined') {
    alert('Library SheetJS belum siap!');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      let list = getSiswaData();
      let count = 0;

      jsonData.forEach((row, i) => {
        if (row["Nama Lengkap Siswa"]) {
          list.push({
            id: Date.now() + i,
            kelas: String(row["Kelas"] || 'X - A').trim(),
            jurusan: String(row["Jurusan"] || '').trim(),
            nisn: String(row["NISN"] || '').trim(),
            nis: String(row["NIS"] || '').trim(),
            nama: String(row["Nama Lengkap Siswa"] || '').trim(),
            jk: String(row["L/P"] || 'L').trim(),
            agama: String(row["Agama"] || 'Islam').trim(),
            tempatLahir: String(row["Tempat Lahir"] || '').trim(),
            tglLahir: String(row["Tanggal Lahir (YYYY-MM-DD)"] || row["Tanggal Lahir"] || '').trim(),
            nik: String(row["NIK"] || '').trim(),
            hp: String(row["No HP"] || '').trim(),
            ayah: String(row["Nama Ayah"] || '').trim(),
            ibu: String(row["Nama Ibu"] || '').trim(),
            pekerjaanOrtu: String(row["Pekerjaan Ortu"] || '').trim(),
            alamat: String(row["Alamat Lengkap"] || '').trim(),
            foto: ''
          });
          count++;
        }
      });

      localStorage.setItem('siakad_siswa_list', JSON.stringify(list));
      renderClassCardsUI();
      renderStudentCardsUI();
      saveAutoBackupToFolder();
      alert(`Berhasil mengimpor ${count} data siswa dari file Excel (.xlsx)!`);
    } catch (err) {
      alert("Gagal membaca file Excel! Pastikan file berformat .xlsx atau .xls.");
    }
  };
  reader.readAsArrayBuffer(file);
}

// DEFAULT MASTER DATA
const defaultMasterData = {
  kelas: ['X - A', 'X - B', 'XI - IPA 1', 'XI - IPS 1', 'XII - IPA 1'],
  mapel: ['Matematika Wajib', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika', 'Pendidikan Agama', 'Biologi', 'Kimia', 'Sejarah'],
  kepegawaian: ['PNS / ASN', 'PPPK', 'Guru Tetap Yayasan (GTY)', 'Guru Tidak Tetap (GTT)'],
  jurusan: ['IPA (Ilmu Pengetahuan Alam)', 'IPS (Ilmu Pengetahuan Sosial)', 'Bahasa & Budaya', 'Teknik Komputer & Jaringan']
};

function getMasterData(type) {
  const data = localStorage.getItem(`master_${type}`);
  if (data) {
    return JSON.parse(data);
  } else {
    localStorage.setItem(`master_${type}`, JSON.stringify(defaultMasterData[type] || []));
    return defaultMasterData[type] || [];
  }
}

function handleAddMasterItem(e, type) {
  e.preventDefault();
  const inputEl = document.getElementById(`inputMaster${type.charAt(0).toUpperCase() + type.slice(1)}`);
  if (!inputEl) return;

  const value = inputEl.value.trim();
  if (value) {
    const list = getMasterData(type);
    if (!list.includes(value)) {
      list.push(value);
      localStorage.setItem(`master_${type}`, JSON.stringify(list));
      inputEl.value = '';
      renderMasterDataUI();
      populateDynamicSelects();
      saveAutoBackupToFolder();
    } else {
      alert('Data ini sudah ada!');
    }
  }
}

function deleteMasterItem(type, index) {
  const list = getMasterData(type);
  if (confirm(`Hapus "${list[index]}" dari master data?`)) {
    list.splice(index, 1);
    localStorage.setItem(`master_${type}`, JSON.stringify(list));
    renderMasterDataUI();
    populateDynamicSelects();
    saveAutoBackupToFolder();
  }
}

function renderMasterDataUI() {
  const types = ['kelas', 'mapel', 'kepegawaian', 'jurusan'];
  types.forEach(type => {
    const container = document.getElementById(`listMaster${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if (!container) return;

    const list = getMasterData(type);
    if (list.length === 0) {
      container.innerHTML = `<p style="font-size: 12px; color: var(--text-muted); font-style: italic;">Belum ada data.</p>`;
      return;
    }

    let html = '<ul class="master-item-list">';
    list.forEach((item, index) => {
      html += `
        <li class="master-item">
          <span>${item}</span>
          <button type="button" class="btn-del-item" onclick="deleteMasterItem('${type}', ${index})" title="Hapus">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </li>
      `;
    });
    html += '</ul>';
    container.innerHTML = html;
  });
}

// GURU MANAGEMENT
function getGuruData() {
  const data = localStorage.getItem('siakad_guru_list');
  if (data) {
    const parsed = JSON.parse(data);
    if (parsed && parsed.length > 0) return parsed;
  }
  
  const defaultGuru = [
    { id: 1, nama: 'Dr. Ahmad Fauzi, M.Pd.', nip: '198203152010011002', nuptk: '1234567890123456', tempatLahir: 'Pontianak', tglLahir: '1982-09-15', jk: 'L', agama: 'Islam', ijazah: 'S3 Pendidikan', tahunIjazah: '2015', mapel: 'Matematika Wajib', kepegawaian: 'PNS / ASN', jabatan: 'Guru Ahli Madya', pangkatGol: 'Pembina / IV-a', tmt: '2010-01-01', masaKerja: '14 Tahun', tmtSekolah: '2012-07-01', sertifikasi: 'Sudah', tahunSertifikasi: '2014', noRekening: '1234567890', hp: '081234567890', email: 'ahmad.fauzi@sekolah.sch.id' }
  ];
  localStorage.setItem('siakad_guru_list', JSON.stringify(defaultGuru));
  return defaultGuru;
}

function openGuruModal(guruId = null) {
  const modal = document.getElementById('modalGuru');
  const title = document.getElementById('modalGuruTitle');
  const editIdInput = document.getElementById('inputGuruEditId');

  if (!modal) return;
  populateDynamicSelects();

  if (guruId) {
    const gurus = getGuruData();
    const guru = gurus.find(g => g.id === guruId);
    if (guru) {
      title.innerText = 'Edit Data Guru';
      editIdInput.value = guru.id;
      document.getElementById('inputNamaGuru').value = guru.nama || '';
      document.getElementById('inputNipGuru').value = guru.nip || '';
      document.getElementById('inputNuptkGuru').value = guru.nuptk || '';
      document.getElementById('inputTempatLahirGuru').value = guru.tempatLahir || '';
      document.getElementById('inputTglLahirGuru').value = guru.tglLahir || '';
      document.getElementById('inputJkGuru').value = guru.jk || 'L';
      document.getElementById('inputAgamaGuru').value = guru.agama || 'Islam';
      document.getElementById('inputIjazahGuru').value = guru.ijazah || '';
      document.getElementById('inputTahunIjazahGuru').value = guru.tahunIjazah || '';
      document.getElementById('inputMapelGuru').value = guru.mapel || '';
      document.getElementById('inputKepegawaianGuru').value = guru.kepegawaian || '';
      document.getElementById('inputJabatanGuru').value = guru.jabatan || '';
      document.getElementById('inputPangkatGolGuru').value = guru.pangkatGol || '';
      document.getElementById('inputTmtGuru').value = guru.tmt || '';
      document.getElementById('inputMasaKerjaGuru').value = guru.masaKerja || '';
      document.getElementById('inputTmtSekolahGuru').value = guru.tmtSekolah || '';
      document.getElementById('inputSertifikasiGuru').value = guru.sertifikasi || 'Belum';
      document.getElementById('inputTahunSertifikasiGuru').value = guru.tahunSertifikasi || '';
      document.getElementById('inputNoRekeningGuru').value = guru.noRekening || '';
      document.getElementById('inputHpGuru').value = guru.hp || '';
      document.getElementById('inputEmailGuru').value = guru.email || '';
    }
  } else {
    title.innerText = 'Tambah Data Guru Baru';
    editIdInput.value = '';
    document.querySelectorAll('#modalGuru input').forEach(i => i.value = '');
    document.querySelectorAll('#modalGuru select').forEach(s => s.selectedIndex = 0);
  }

  modal.classList.remove('hidden');
}

function closeGuruModal() {
  const modal = document.getElementById('modalGuru');
  if (modal) modal.classList.add('hidden');
}

function handleSaveGuru(e) {
  e.preventDefault();

  const editId = document.getElementById('inputGuruEditId').value;
  const newGuruData = {
    id: editId ? Number(editId) : Date.now(),
    nama: document.getElementById('inputNamaGuru').value.trim(),
    nip: document.getElementById('inputNipGuru').value.trim(),
    nuptk: document.getElementById('inputNuptkGuru').value.trim(),
    tempatLahir: document.getElementById('inputTempatLahirGuru').value.trim(),
    tglLahir: document.getElementById('inputTglLahirGuru').value,
    jk: document.getElementById('inputJkGuru').value,
    agama: document.getElementById('inputAgamaGuru').value,
    ijazah: document.getElementById('inputIjazahGuru').value.trim(),
    tahunIjazah: document.getElementById('inputTahunIjazahGuru').value.trim(),
    mapel: document.getElementById('inputMapelGuru').value,
    kepegawaian: document.getElementById('inputKepegawaianGuru').value,
    jabatan: document.getElementById('inputJabatanGuru').value.trim(),
    pangkatGol: document.getElementById('inputPangkatGolGuru').value.trim(),
    tmt: document.getElementById('inputTmtGuru').value,
    masaKerja: document.getElementById('inputMasaKerjaGuru').value.trim(),
    tmtSekolah: document.getElementById('inputTmtSekolahGuru').value,
    sertifikasi: document.getElementById('inputSertifikasiGuru').value,
    tahunSertifikasi: document.getElementById('inputTahunSertifikasiGuru').value.trim(),
    noRekening: document.getElementById('inputNoRekeningGuru').value.trim(),
    hp: document.getElementById('inputHpGuru').value.trim(),
    email: document.getElementById('inputEmailGuru').value.trim()
  };

  let list = getGuruData();

  if (editId) {
    list = list.map(g => g.id === Number(editId) ? newGuruData : g);
  } else {
    list.push(newGuruData);
  }

  localStorage.setItem('siakad_guru_list', JSON.stringify(list));
  closeGuruModal();
  renderGuruListUI();
  populateDynamicSelects();
  renderBirthdayWidget();
  saveAutoBackupToFolder();
  showToast(`Data guru ${newGuruData.nama} berhasil disimpan!`, 'success');
}

function deleteGuruItem(id) {
  let list = getGuruData();
  const item = list.find(g => g.id === id);
  if (item && confirm(`Hapus data guru "${item.nama}"?`)) {
    list = list.filter(g => g.id !== id);
    localStorage.setItem('siakad_guru_list', JSON.stringify(list));
    renderGuruListUI();
    populateDynamicSelects();
    renderBirthdayWidget();
    saveAutoBackupToFolder();
    showToast('Data guru berhasil dihapus!', 'success');
  }
}

function renderGuruListUI() {
  const tbody = document.getElementById('tableGuruBody');
  if (!tbody) return;

  const list = getGuruData();
  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="padding: 20px; text-align: center; color: var(--text-muted); font-style: italic;">
          Belum ada data guru terdaftar. Klik "+ Tambah Guru" di atas.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  list.forEach((guru, idx) => {
    html += `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-weight: 600;">${guru.nama}</td>
        <td>${guru.nip || '-'}<br><span style="font-size: 11px; color: var(--text-muted);">NUPTK: ${guru.nuptk || '-'}</span></td>
        <td>${guru.mapel || '-'}</td>
        <td>${guru.ijazah || '-'}<br><span style="font-size: 11px; color: var(--text-muted);">${guru.tahunIjazah || ''}</span></td>
        <td>${guru.pangkatGol || '-'}<br><span style="font-size: 11px; color: var(--text-muted);">${guru.jabatan || ''}</span></td>
        <td><span style="background: var(--accent-soft); padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;">${guru.sertifikasi || 'Belum'}</span></td>
        <td style="text-align: center;">
          <div class="action-btn-group">
            <button type="button" class="btn-icon-action" onclick="openGuruModal(${guru.id})" title="Edit Guru">
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button type="button" class="btn-icon-action del" onclick="deleteGuruItem(${guru.id})" title="Hapus">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// SISWA MANAGEMENT
function getSiswaData() {
  const data = localStorage.getItem('siakad_siswa_list');
  if (data) {
    const parsed = JSON.parse(data);
    if (parsed && parsed.length > 0) return parsed;
  }

  const defaultSiswa = [
    { id: 101, nisn: '0051234561', nis: '23241001', nama: 'Aditya Pratama', kelas: 'X - A', jurusan: 'IPA (Ilmu Pengetahuan Alam)', jk: 'L', agama: 'Islam', tempatLahir: 'Jakarta', tglLahir: '2008-04-12', nik: '3171000000000001', hp: '081299990000', ayah: 'Budi Pratama', ibu: 'Siti Rahma', pekerjaanOrtu: 'PNS', alamat: 'Jl. Merdeka No. 12', foto: '' },
    { id: 102, nisn: '0051234562', nis: '23241002', nama: 'Anisa Rahmawati', kelas: 'X - A', jurusan: 'IPA (Ilmu Pengetahuan Alam)', jk: 'P', agama: 'Islam', tempatLahir: 'Bandung', tglLahir: '2008-08-25', nik: '3171000000000002', hp: '081299990001', ayah: 'Hendra', ibu: 'Dewi', pekerjaanOrtu: 'Wiraswasta', alamat: 'Jl. Mawar No. 4', foto: '' },
    { id: 103, nisn: '0051234563', nis: '23241003', nama: 'Budi Santoso', kelas: 'XI - IPA 1', jurusan: 'IPA (Ilmu Pengetahuan Alam)', jk: 'L', agama: 'Islam', tempatLahir: 'Bogor', tglLahir: '2007-02-10', nik: '3171000000000003', hp: '081299990002', ayah: 'Suharto', ibu: 'Sri', pekerjaanOrtu: 'Swasta', alamat: 'Jl. Pemuda No. 8', foto: '' }
  ];
  localStorage.setItem('siakad_siswa_list', JSON.stringify(defaultSiswa));
  return defaultSiswa;
}

function renderClassCardsUI() {
  const container = document.getElementById('classCardContainer');
  if (!container) return;

  const kelass = getMasterData('kelas');
  const siswas = getSiswaData();

  let html = '';
  kelass.forEach(kelas => {
    const count = siswas.filter(s => s.kelas === kelas).length;

    html += `
      <div class="class-summary-card" onclick="openSiswaClassModal('${kelas}')">
        <div>
          <div class="class-card-icon">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 1 3-3.87"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div class="class-card-title">${kelas}</div>
          <div class="class-card-count">${count} <span style="font-size: 14px; font-weight: 500;">Siswa</span></div>
        </div>
        <div class="class-card-sub">Klik untuk melihat rincian detail →</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function openSiswaClassModal(kelas) {
  const modal = document.getElementById('modalSiswaDetail');
  const title = document.getElementById('modalSiswaClassTitle');

  if (!modal) return;

  title.innerText = `Buku Induk Siswa - Kelas ${kelas}`;
  modal.classList.remove('hidden');
  renderSiswaTableUI(kelas);
}

function closeSiswaDetailModal() {
  const modal = document.getElementById('modalSiswaDetail');
  if (modal) modal.classList.add('hidden');
}

function renderSiswaTableUI(kelas) {
  const tbody = document.getElementById('tableSiswaBody');
  if (!tbody) return;

  const siswas = getSiswaData().filter(s => s.kelas === kelas);

  if (siswas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="padding: 20px; text-align: center; color: var(--text-muted); font-style: italic;">
          Belum ada murid terdaftar di kelas ${kelas}.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  siswas.forEach((siswa, idx) => {
    html += `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><b>${siswa.nisn}</b><br><span style="font-size: 11px; color: var(--text-muted);">NIS: ${siswa.nis}</span></td>
        <td style="font-weight: 600;">${siswa.nama}</td>
        <td>${siswa.jurusan || '-'}</td>
        <td style="text-align: center;">${siswa.jk}</td>
        <td>${siswa.ayah || '-'}<br><span style="font-size: 11px; color: var(--text-muted);">${siswa.ibu || ''}</span></td>
        <td>${siswa.hp || '-'}</td>
        <td style="text-align: center;">
          <div class="action-btn-group">
            <button type="button" class="btn-icon-action del" onclick="deleteSiswaItem(${siswa.id}, '${kelas}')" title="Hapus Siswa">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function openAddSiswaModalGlobal() {
  const modal = document.getElementById('modalAddSiswaGlobal');
  if (!modal) return;

  populateDynamicSelects();
  document.querySelectorAll('#modalAddSiswaGlobal input').forEach(i => i.value = '');
  document.querySelectorAll('#modalAddSiswaGlobal textarea').forEach(t => t.value = '');

  modal.classList.remove('hidden');
}

function closeAddSiswaModalGlobal() {
  const modal = document.getElementById('modalAddSiswaGlobal');
  if (modal) modal.classList.add('hidden');
}

function handleSaveSiswaGlobal(e) {
  e.preventDefault();

  const newSiswa = {
    id: Date.now(),
    kelas: document.getElementById('inputSiswaKelasGlobal').value,
    jurusan: document.getElementById('inputSiswaJurusanGlobal').value,
    nisn: document.getElementById('inputSiswaNisnGlobal').value.trim(),
    nis: document.getElementById('inputSiswaNisGlobal').value.trim(),
    nama: document.getElementById('inputSiswaNamaGlobal').value.trim(),
    jk: document.getElementById('inputSiswaJkGlobal').value,
    agama: document.getElementById('inputSiswaAgamaGlobal').value,
    tempatLahir: document.getElementById('inputSiswaTempatLahirGlobal').value.trim(),
    tglLahir: document.getElementById('inputSiswaTglLahirGlobal').value,
    nik: document.getElementById('inputSiswaNikGlobal').value.trim(),
    hp: document.getElementById('inputSiswaHpGlobal').value.trim(),
    ayah: document.getElementById('inputSiswaAyahGlobal').value.trim(),
    ibu: document.getElementById('inputSiswaIbuGlobal').value.trim(),
    pekerjaanOrtu: document.getElementById('inputSiswaPekerjaanOrtuGlobal').value.trim(),
    alamat: document.getElementById('inputSiswaAlamatGlobal').value.trim(),
    foto: ''
  };

  let list = getSiswaData();
  list.push(newSiswa);

  localStorage.setItem('siakad_siswa_list', JSON.stringify(list));

  closeAddSiswaModalGlobal();
  renderClassCardsUI();
  renderStudentCardsUI();
  saveAutoBackupToFolder();
  showToast(`Siswa ${newSiswa.nama} berhasil didaftarkan ke kelas ${newSiswa.kelas}!`, 'success');
}

function deleteSiswaItem(id, kelas) {
  let list = getSiswaData();
  const item = list.find(s => s.id === id);
  if (item && confirm(`Hapus siswa "${item.nama}"?`)) {
    list = list.filter(s => s.id !== id);
    localStorage.setItem('siakad_siswa_list', JSON.stringify(list));
    renderSiswaTableUI(kelas);
    renderClassCardsUI();
    renderStudentCardsUI();
    saveAutoBackupToFolder();
    showToast('Data siswa berhasil dihapus!', 'success');
  }
}

// JADWAL & JAM AJAR
function getJadwalData() {
  const data = localStorage.getItem('siakad_jadwal_list');
  if (data) {
    const parsed = JSON.parse(data);
    if (parsed && parsed.length > 0) return parsed;
  }

  const defaultJadwal = [
    { id: 1, hari: 'Senin', jam: 'Jam 1 - 2 (07:00 - 08:30)', guru: 'Dr. Ahmad Fauzi, M.Pd.', mapel: 'Matematika Wajib', kelas: 'X - A' },
    { id: 2, hari: 'Senin', jam: 'Jam 3 - 4 (08:30 - 10:00)', guru: 'Dr. Ahmad Fauzi, M.Pd.', mapel: 'Matematika Wajib', kelas: 'XI - IPA 1' }
  ];
  localStorage.setItem('siakad_jadwal_list', JSON.stringify(defaultJadwal));
  return defaultJadwal;
}

function handleSaveJadwal(e) {
  e.preventDefault();

  const guruSelect = document.getElementById('inputJadwalGuru');
  const guruNama = guruSelect.options[guruSelect.selectedIndex] ? guruSelect.options[guruSelect.selectedIndex].text.split(' (')[0] : '';

  const newJadwal = {
    id: Date.now(),
    hari: document.getElementById('inputJadwalHari').value,
    jam: document.getElementById('inputJadwalJam').value,
    guru: guruNama,
    mapel: document.getElementById('inputJadwalMapel').value,
    kelas: document.getElementById('inputJadwalKelas').value
  };

  let list = getJadwalData();
  list.push(newJadwal);

  localStorage.setItem('siakad_jadwal_list', JSON.stringify(list));
  renderJadwalTableUI();
  saveAutoBackupToFolder();
  showToast('Jadwal pelajaran berhasil ditambahkan!', 'success');
}

function deleteJadwalItem(id) {
  let list = getJadwalData();
  if (confirm('Hapus alokasi jadwal pelajaran ini?')) {
    list = list.filter(j => j.id !== id);
    localStorage.setItem('siakad_jadwal_list', JSON.stringify(list));
    renderJadwalTableUI();
    saveAutoBackupToFolder();
    showToast('Jadwal berhasil dihapus!', 'success');
  }
}

function renderJadwalTableUI() {
  const tbody = document.getElementById('tableJadwalBody');
  if (!tbody) return;

  const list = getJadwalData();
  const filterKelas = document.getElementById('filterJadwalKelas') ? document.getElementById('filterJadwalKelas').value : '';
  const filterHari = document.getElementById('filterJadwalHari') ? document.getElementById('filterJadwalHari').value : '';

  let filtered = list;
  if (filterKelas) filtered = filtered.filter(j => j.kelas === filterKelas);
  if (filterHari) filtered = filtered.filter(j => j.hari === filterHari);

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="padding: 20px; text-align: center; color: var(--text-muted); font-style: italic;">
          Belum ada jadwal pelajaran yang teralokasikan. Gunakan form di atas untuk menambahkan.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  filtered.forEach((jadwal, idx) => {
    html += `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><span style="background: var(--accent-soft); padding: 2px 8px; border-radius: 4px; font-weight: 700;">${jadwal.hari}</span></td>
        <td>${jadwal.jam}</td>
        <td><b>${jadwal.kelas}</b></td>
        <td>${jadwal.mapel}</td>
        <td>${jadwal.guru || '-'}</td>
        <td style="text-align: center;">
          <button type="button" class="btn-icon-action del" onclick="deleteJadwalItem(${jadwal.id})" title="Hapus Jadwal">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// PRESENSI & ABSENSI SISWA
function getAbsensiData() {
  const data = localStorage.getItem('siakad_absensi_list');
  return data ? JSON.parse(data) : [];
}

function renderAbsensiTableUI() {
  const tbody = document.getElementById('tableAbsensiBody');
  const tglInput = document.getElementById('inputAbsensiTanggal');
  const selectKelas = document.getElementById('selectAbsensiKelas');
  if (!tbody || !selectKelas) return;

  if (tglInput && !tglInput.value) {
    const today = new Date().toISOString().split('T')[0];
    tglInput.value = today;
  }

  const selectedKelas = selectKelas.value;
  const selectedTanggal = tglInput ? tglInput.value : '';

  if (!selectedKelas) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="padding: 24px; text-align: center; color: var(--text-muted); font-style: italic;">
          Silakan pilih Rombongan Belajar (Kelas) di atas untuk menampilkan daftar presensi siswa.
        </td>
      </tr>
    `;
    updateAbsensiSummaryCounters();
    return;
  }

  const siswas = getSiswaData().filter(s => s.kelas === selectedKelas);

  if (siswas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="padding: 24px; text-align: center; color: var(--text-muted); font-style: italic;">
          Belum ada data siswa terdaftar pada kelas ${selectedKelas}.
        </td>
      </tr>
    `;
    updateAbsensiSummaryCounters();
    return;
  }

  const absensiRecords = getAbsensiData();
  const existingDayRecord = absensiRecords.find(a => a.kelas === selectedKelas && a.tanggal === selectedTanggal);

  let html = '';
  siswas.forEach((siswa, idx) => {
    let studentStatus = 'H';
    let studentNote = '';

    if (existingDayRecord && existingDayRecord.details) {
      const studentRecord = existingDayRecord.details.find(d => d.siswaId === siswa.id);
      if (studentRecord) {
        studentStatus = studentRecord.status || 'H';
        studentNote = studentRecord.ket || '';
      }
    }

    html += `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><b>${siswa.nisn}</b><br><span style="font-size: 11px; color: var(--text-muted);">NIS: ${siswa.nis}</span></td>
        <td style="font-weight: 600;">${siswa.nama}</td>
        <td style="text-align: center;">${siswa.jk}</td>
        <td style="text-align: center;">
          <div style="display: inline-flex; gap: 8px;" class="absensi-radio-group">
            <label style="cursor: pointer; font-size: 12px; font-weight: 700; color: #10B981;">
              <input type="radio" name="status_siswa_${siswa.id}" value="H" ${studentStatus === 'H' ? 'checked' : ''} onchange="updateAbsensiSummaryCounters()"> H
            </label>
            <label style="cursor: pointer; font-size: 12px; font-weight: 700; color: #F59E0B;">
              <input type="radio" name="status_siswa_${siswa.id}" value="S" ${studentStatus === 'S' ? 'checked' : ''} onchange="updateAbsensiSummaryCounters()"> S
            </label>
            <label style="cursor: pointer; font-size: 12px; font-weight: 700; color: #3B82F6;">
              <input type="radio" name="status_siswa_${siswa.id}" value="I" ${studentStatus === 'I' ? 'checked' : ''} onchange="updateAbsensiSummaryCounters()"> I
            </label>
            <label style="cursor: pointer; font-size: 12px; font-weight: 700; color: #EF4444;">
              <input type="radio" name="status_siswa_${siswa.id}" value="A" ${studentStatus === 'A' ? 'checked' : ''} onchange="updateAbsensiSummaryCounters()"> A
            </label>
          </div>
        </td>
        <td>
          <input type="text" id="note_siswa_${siswa.id}" value="${studentNote}" placeholder="Keterangan (misal: Demam)" style="padding: 4px 8px; font-size: 12px; width: 100%;">
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  updateAbsensiSummaryCounters();
}

function updateAbsensiSummaryCounters() {
  let h = 0, s = 0, i = 0, a = 0;
  const radioInputs = document.querySelectorAll('#tableAbsensiBody input[type="radio"]:checked');

  radioInputs.forEach(radio => {
    if (radio.value === 'H') h++;
    else if (radio.value === 'S') s++;
    else if (radio.value === 'I') i++;
    else if (radio.value === 'A') a++;
  });

  const elH = document.getElementById('countHadir');
  const elS = document.getElementById('countSakit');
  const elI = document.getElementById('countIzin');
  const elA = document.getElementById('countAlpa');

  if (elH) elH.innerText = h;
  if (elS) elS.innerText = s;
  if (elI) elI.innerText = i;
  if (elA) elA.innerText = a;
}

function handleSaveAbsensi(e) {
  e.preventDefault();

  const selectedKelas = document.getElementById('selectAbsensiKelas').value;
  const selectedTanggal = document.getElementById('inputAbsensiTanggal').value;
  const selectedMapel = document.getElementById('selectAbsensiMapel').value;

  if (!selectedKelas || !selectedTanggal) {
    alert('Silakan pilih Kelas dan Tanggal presensi terlebih dahulu!');
    return;
  }

  const siswas = getSiswaData().filter(s => s.kelas === selectedKelas);
  if (siswas.length === 0) {
    alert('Tidak ada siswa pada kelas ini untuk disimpan presensinya!');
    return;
  }

  const details = siswas.map(siswa => {
    const selectedRadio = document.querySelector(`input[name="status_siswa_${siswa.id}"]:checked`);
    const noteInput = document.getElementById(`note_siswa_${siswa.id}`);
    return {
      siswaId: siswa.id,
      nama: siswa.nama,
      status: selectedRadio ? selectedRadio.value : 'H',
      ket: noteInput ? noteInput.value.trim() : ''
    };
  });

  let absensiList = getAbsensiData();
  const existingIdx = absensiList.findIndex(a => a.kelas === selectedKelas && a.tanggal === selectedTanggal);

  const newRecord = {
    id: existingIdx >= 0 ? absensiList[existingIdx].id : Date.now(),
    kelas: selectedKelas,
    tanggal: selectedTanggal,
    mapel: selectedMapel,
    details: details,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    absensiList[existingIdx] = newRecord;
  } else {
    absensiList.push(newRecord);
  }

  localStorage.setItem('siakad_absensi_list', JSON.stringify(absensiList));
  saveAutoBackupToFolder();
  showToast(`Presensi Kelas ${selectedKelas} Tanggal ${selectedTanggal} Berhasil Disimpan!`, 'success');
}

// ===================================================
// DASHBOARD STATS & DYNAMIC RENDERER
// ===================================================
function renderDashboardUI() {
  // 1. Render Tanggal Realtime Hari Ini & Periode Akademik
  const dateEl = document.getElementById('dashTodayDate');
  const today = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const dayName = days[today.getDay()];
  const dateStr = `${dayName}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  if (dateEl) dateEl.innerText = dateStr;

  updateAcademicPeriodUI();

  // 2. Render KPI Metrics Realtime
  const siswaList = getSiswaData();
  const guruList = getGuruData();
  const kelasList = getMasterData('kelas');
  const absensiList = getAbsensiData();

  const elSiswa = document.getElementById('dashCountSiswa');
  const elGuru = document.getElementById('dashCountGuru');
  const elKelas = document.getElementById('dashCountKelas');

  if (elSiswa) elSiswa.innerText = siswaList.length.toLocaleString('id-ID');
  if (elGuru) elGuru.innerText = guruList.length.toLocaleString('id-ID');
  if (elKelas) elKelas.innerText = kelasList.length.toLocaleString('id-ID');

  // Calculate Presensi Hari Ini
  const todayISO = today.toISOString().split('T')[0];
  const todayAbsensi = absensiList.filter(a => a.tanggal === todayISO);

  const elPercent = document.getElementById('dashPresensiPercent');
  const elSub = document.getElementById('dashPresensiSub');

  if (todayAbsensi.length > 0) {
    let totalHadir = 0;
    let totalMurid = 0;

    todayAbsensi.forEach(rec => {
      if (rec.details) {
        rec.details.forEach(d => {
          totalMurid++;
          if (d.status === 'H') totalHadir++;
        });
      }
    });

    const percent = totalMurid > 0 ? Math.round((totalHadir / totalMurid) * 100) : 0;
    if (elPercent) elPercent.innerText = `${percent}%`;
    if (elSub) elSub.innerText = `${totalHadir} dari ${totalMurid} murid hadir hari ini`;
  } else {
    if (elPercent) elPercent.innerText = '0%';
    if (elSub) elSub.innerText = 'Belum ada input presensi hari ini';
  }

  // 3. Render Jadwal Pelajaran Hari Ini
  renderTodayJadwal(dayName);

  // 4. Render Notifikasi Ulang Tahun Guru & Grafik Kehadiran
  renderBirthdayWidget();
  renderAttendanceChartSVG();
}

function renderTodayJadwal(dayName) {
  const tbody = document.getElementById('dashTableJadwalHariIni');
  const elDayName = document.getElementById('dashTodayName');

  if (elDayName) elDayName.innerText = dayName;
  if (!tbody) return;

  const jadwalList = getJadwalData();
  const todayJadwal = jadwalList.filter(j => j.hari.toLowerCase() === dayName.toLowerCase());

  if (todayJadwal.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="padding: 20px; text-align: center; color: var(--text-muted); font-style: italic;">
          Tidak ada jadwal mata pelajaran untuk hari ${dayName}.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  todayJadwal.forEach((jadwal, idx) => {
    html += `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><span style="background: var(--accent-soft); padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px;">${jadwal.jam}</span></td>
        <td><b>${jadwal.kelas}</b></td>
        <td>${jadwal.mapel}</td>
        <td>${jadwal.guru || '-'}</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// RENDER KARTU SISWA GENERATOR
function renderStudentCardsUI() {
  const container = document.getElementById('studentCardContainer');
  const selectClass = document.getElementById('selectClassKartu');
  if (!container) return;

  const selectedClass = selectClass ? selectClass.value : '';
  const siswas = getSiswaData();
  const schoolName = localStorage.getItem('school_name') || 'SMA NEGERI 1 DIGITAL';
  const schoolLogo = localStorage.getItem('school_logo');

  const filtered = selectedClass ? siswas.filter(s => s.kelas === selectedClass) : siswas;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 30px; text-align: center; background: var(--input-bg); border: 1px dashed var(--border-color); border-radius: 12px;">
        <p style="font-size: 14px; color: var(--text-muted); font-weight: 600;">Belum ada data siswa untuk kelas ini.</p>
        <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Tambahkan siswa di menu <b>Buku Induk Siswa</b> atau ubah filter kelas di atas.</p>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(siswa => {
    const photoSrc = siswa.foto ? siswa.foto : '';

    html += `
      <div class="student-id-card">
        <div class="id-card-header">
          <div class="id-card-logo">
            ${schoolLogo ? `<img src="${schoolLogo}">` : `<svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`}
          </div>
          <div class="id-card-school-title">${schoolName}</div>
        </div>

        <div class="id-card-body">
          <label class="id-card-photo-box" title="Klik untuk upload foto siswa">
            ${photoSrc ? `<img src="${photoSrc}">` : `<span>+ Upload Foto</span>`}
            <input type="file" accept="image/*" onchange="uploadSiswaPhoto(event, ${siswa.id})" style="display:none;">
          </label>

          <div class="id-card-details">
            <div class="id-card-name">${siswa.nama}</div>
            <div class="id-card-row"><strong>NISN:</strong> ${siswa.nisn || '-'}</div>
            <div class="id-card-row"><strong>NIS:</strong> ${siswa.nis || '-'}</div>
            <div class="id-card-row"><strong>Kelas:</strong> ${siswa.kelas || '-'}</div>
            <div class="id-card-row"><strong>Jurusan:</strong> ${siswa.jurusan || '-'}</div>
          </div>
        </div>

        <div class="id-card-footer">KARTU TANDA SISWA RESMI</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function uploadSiswaPhoto(event, siswaId) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    let list = getSiswaData();
    list = list.map(s => s.id === siswaId ? { ...s, foto: e.target.result } : s);
    localStorage.setItem('siakad_siswa_list', JSON.stringify(list));
    renderStudentCardsUI();
    saveAutoBackupToFolder();
    showToast('Foto siswa berhasil diunggah!', 'success');
  };
  reader.readAsDataURL(file);
}

function populateDynamicSelects() {
  const jurusanSelects = document.querySelectorAll('select[data-master="jurusan"]');
  const jurusans = getMasterData('jurusan');
  jurusanSelects.forEach(select => {
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Pilih Jurusan --</option>' +
      jurusans.map(j => `<option value="${j}">${j}</option>`).join('');
    if (currentVal && jurusans.includes(currentVal)) select.value = currentVal;
  });

  const kelasSelects = document.querySelectorAll('select[data-master="kelas"]');
  const kelass = getMasterData('kelas');
  kelasSelects.forEach(select => {
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Pilih Kelas --</option>' +
      kelass.map(k => `<option value="${k}">${k}</option>`).join('');
    if (currentVal && kelass.includes(currentVal)) select.value = currentVal;
  });

  const mapelSelects = document.querySelectorAll('select[data-master="mapel"]');
  const mapels = getMasterData('mapel');
  mapelSelects.forEach(select => {
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Pilih Mapel --</option>' +
      mapels.map(m => `<option value="${m}">${m}</option>`).join('');
    if (currentVal && mapels.includes(currentVal)) select.value = currentVal;
  });

  const kepSelects = document.querySelectorAll('select[data-master="kepegawaian"]');
  const keps = getMasterData('kepegawaian');
  kepSelects.forEach(select => {
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Pilih Status --</option>' +
      keps.map(k => `<option value="${k}">${k}</option>`).join('');
    if (currentVal && keps.includes(currentVal)) select.value = currentVal;
  });

  const guruSelects = document.querySelectorAll('select[data-master="guru"]');
  const gurus = getGuruData();
  guruSelects.forEach(select => {
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Pilih Guru --</option>' +
      gurus.map(g => `<option value="${g.id}">${g.nama} (${g.mapel || '-'})</option>`).join('');
    if (currentVal) select.value = currentVal;
  });
}

function renderBirthdayWidget() {
  const container = document.getElementById('dashboardBirthdayNotice');
  if (!container) return;

  const gurus = getGuruData();
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  // Filter guru yang berulang tahun bulan ini
  const birthdayGurus = gurus.filter(g => {
    if (!g.tglLahir) return false;
    const parts = g.tglLahir.split('-');
    const m = parseInt(parts[1], 10);
    return m === currentMonth;
  });

  if (birthdayGurus.length === 0) {
    container.innerHTML = '';
    return;
  }

  // Cek jika ada guru yang tepat berulang tahun HARI INI
  const todayGurus = birthdayGurus.filter(g => {
    const d = parseInt(g.tglLahir.split('-')[2], 10);
    return d === currentDay;
  });

  let guruListText = '';

  if (todayGurus.length > 0) {
    const names = todayGurus.map(g => `<b>${g.nama}</b>`).join(', ');
    guruListText = `🎂 <strong>HARI INI BERULANG TAHUN! 🎉</strong> Selamat Ulang Tahun kepada ${names}! Semoga sehat dan sukses selalu.`;
  } else {
    const names = birthdayGurus.map(g => {
      const d = parseInt(g.tglLahir.split('-')[2], 10);
      return `<b>${g.nama}</b> (${d} ${monthNames[currentMonth]})`;
    }).join(', ');
    guruListText = `🎂 <strong>Ulang Tahun Guru Bulan ${monthNames[currentMonth]}:</strong> ${names}`;
  }

  container.innerHTML = `
    <div style="background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%); color: #FFFFFF; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
      <div style="font-size: 13px; line-height: 1.5;">
        ${guruListText}
      </div>
      <button type="button" onclick="loadPage('guru')" style="background: rgba(255,255,255,0.2); border: none; color: #FFF; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; margin-left: 12px;">
        Lihat Data Guru →
      </button>
    </div>
  `;
}

function saveSchoolProfile(e) {
  e.preventDefault();

  const schoolName = document.getElementById('inputNamaSekolah').value;
  const schoolEmail = document.getElementById('inputEmailSekolah').value;
  const schoolPhone = document.getElementById('inputTelpSekolah').value;

  if (schoolName) localStorage.setItem('school_name', schoolName);
  if (schoolEmail) localStorage.setItem('school_email', schoolEmail);
  if (schoolPhone) localStorage.setItem('school_phone', schoolPhone);

  updateHeaderUI();
  saveAutoBackupToFolder();
  showToast('Profil Sekolah Berhasil Disimpan!', 'success');
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      localStorage.setItem('school_logo', e.target.result);
      updateHeaderUI();
      saveAutoBackupToFolder();
      showToast('Logo sekolah berhasil diperbarui!', 'success');
    };
    reader.readAsDataURL(file);
  }
}

function updateHeaderUI() {
  const name = localStorage.getItem('school_name') || 'SMA Negeri 1 Digital';
  const email = localStorage.getItem('school_email') || 'info@sekolah.sch.id';
  const phone = localStorage.getItem('school_phone') || '(021) 555-0192';
  const logo = localStorage.getItem('school_logo');

  const elName = document.getElementById('displayNamaSekolah');
  const elEmail = document.getElementById('displayEmailSekolah');
  const elPhone = document.getElementById('displayTelpSekolah');
  const elLogo = document.getElementById('displayLogoSekolah');
  const elLoginLogo = document.getElementById('loginLogoDisplay');

  if (elName) elName.innerText = name;
  if (elEmail) elEmail.innerText = email;
  if (elPhone) elPhone.innerText = phone;

  if (elLogo) {
    elLogo.innerHTML = logo ? `<img src="${logo}" alt="Logo">` : `<svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
  }

  if (elLoginLogo && logo) {
    elLoginLogo.innerHTML = `<img src="${logo}" alt="Logo">`;
  }
}

function loadSchoolSettings() {
  const savedTheme = localStorage.getItem('app_theme') || 'sage';
  setTheme(savedTheme);

  const nameInput = document.getElementById('inputNamaSekolah');
  const emailInput = document.getElementById('inputEmailSekolah');
  const phoneInput = document.getElementById('inputTelpSekolah');
  const urlInput = document.getElementById('inputSupabaseUrl');
  const keyInput = document.getElementById('inputSupabaseKey');
  const modeSelect = document.getElementById('selectStorageMode');

  if (nameInput && localStorage.getItem('school_name')) nameInput.value = localStorage.getItem('school_name');
  if (emailInput && localStorage.getItem('school_email')) emailInput.value = localStorage.getItem('school_email');
  if (phoneInput && localStorage.getItem('school_phone')) phoneInput.value = localStorage.getItem('school_phone');
  if (urlInput && localStorage.getItem('supabase_url')) urlInput.value = localStorage.getItem('supabase_url');
  if (keyInput && localStorage.getItem('supabase_key')) keyInput.value = localStorage.getItem('supabase_key');
  
  if (modeSelect) {
    const savedMode = localStorage.getItem('storage_mode') || 'local';
    modeSelect.value = savedMode;
    toggleStorageModeUI();
  }

  updateHeaderUI();
  updateAcademicPeriodUI();
  checkStoragePersistence();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSchoolSettings);
} else {
  loadSchoolSettings();
}