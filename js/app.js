// SISTEM AUTHENTICATION & DYNAMIC PAGE LOADER WITH AUTO-POPULATE

function checkAuthStatus() {
  const isLoggedIn = sessionStorage.getItem('siakad_auth');
  const loginOverlay = document.getElementById('loginOverlay');

  if (isLoggedIn === 'true') {
    if (loginOverlay) loginOverlay.classList.add('hidden');
    loadPage('dashboard');
  } else {
    if (loginOverlay) loginOverlay.classList.remove('hidden');
  }
}

function handleLogin(e) {
  e.preventDefault();

  const user = document.getElementById('loginUsername').value.trim();
  const pass = document.getElementById('loginPassword').value.trim();
  const errorMsg = document.getElementById('loginErrorMsg');

  if (user.toLowerCase() === 'admin' && pass === 'admin') {
    sessionStorage.setItem('siakad_auth', 'true');
    if (errorMsg) errorMsg.style.display = 'none';

    document.getElementById('loginOverlay').classList.add('hidden');
    loadPage('dashboard');
  } else {
    if (errorMsg) errorMsg.style.display = 'block';
  }
}

function handleLogout() {
  if (confirm('Apakah Abah yakin ingin keluar dari aplikasi?')) {
    sessionStorage.removeItem('siakad_auth');
    document.getElementById('loginOverlay').classList.remove('hidden');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
  }
}

// Built-in Templates dengan data-master attribute untuk sinkronisasi otomatis
const builtInTemplates = {
  dashboard: `
    <div class="section-title">
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      Dashboard Ringkasan Data Sekolah
    </div>
    <div class="dashboard-metrics-grid">
      <div class="metric-card">
        <div class="metric-icon" style="background-color: var(--accent-soft);">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 1 3-3.87"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <div class="metric-info">
          <h3>Total Siswa Aktif</h3>
          <p class="metric-number">1,240 Siswa</p>
          <span class="metric-sub">Terdaftar di Buku Induk</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background-color: var(--accent-soft);">
          <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="metric-info">
          <h3>Tenaga Pendidik (Guru)</h3>
          <p class="metric-number">78 Guru</p>
          <span class="metric-sub">PNS, PPPK & GTY</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background-color: var(--accent-soft);">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="metric-info">
          <h3>Rombongan Belajar</h3>
          <p class="metric-number">36 Kelas</p>
          <span class="metric-sub">Kelas X, XI, dan XII</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background-color: var(--accent-soft);">
          <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <div class="metric-info">
          <h3>Presensi Hari Ini</h3>
          <p class="metric-number">96.8% Hadir</p>
          <span class="metric-sub">32 Sakit / Izin, 4 Alpa</span>
        </div>
      </div>
    </div>
  `,

  siswa: `
    <div class="section-title">
      <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
      Buku Induk Peserta Didik (Standar Dinas Pendidikan)
    </div>
    <form onsubmit="event.preventDefault();">
      <div class="form-grid">
        <div class="form-group">
          <label>NISN (Nomor Induk Siswa Nasional)</label>
          <input type="text" placeholder="Contoh: 0051234567" required>
        </div>
        <div class="form-group">
          <label>NIS (Nomor Induk Sekolah)</label>
          <input type="text" placeholder="Contoh: 23241001" required>
        </div>
        <div class="form-group">
          <label>NIK Siswa</label>
          <input type="text" placeholder="16 Digit NIK sesuai KK">
        </div>
        <div class="form-group full-width">
          <label>Nama Lengkap Siswa</label>
          <input type="text" placeholder="Nama sesuai ijazah sebelumnya" required>
        </div>
        <div class="form-group">
          <label>Tempat Lahir</label>
          <input type="text" placeholder="Kota / Kabupaten">
        </div>
        <div class="form-group">
          <label>Tanggal Lahir</label>
          <input type="date">
        </div>
        <div class="form-group">
          <label>Jenis Kelamin</label>
          <select>
            <option value="">-- Pilih --</option>
            <option value="L">Laki-Laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div class="form-group">
          <label>Jurusan / Program Keahlian</label>
          <select data-master="jurusan">
            <option value="">-- Pilih Jurusan --</option>
          </select>
        </div>
        <div class="form-group">
          <label>Rombongan Belajar / Kelas</label>
          <select data-master="kelas" required>
            <option value="">-- Pilih Kelas --</option>
          </select>
        </div>
        <div class="form-group full-width">
          <label>Alamat Lengkap Siswa</label>
          <textarea rows="2" placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan Data Siswa</button>
      </div>
    </form>
  `,

  guru: `
    <div class="section-title">
      <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 1 3-3.87"/><circle cx="9" cy="7" r="4"/></svg>
      Database Master Guru & Tenaga Pendidik
    </div>
    <form onsubmit="event.preventDefault();">
      <div class="form-grid">
        <div class="form-group">
          <label>NIP / NIY (Nomor Induk Guru)</label>
          <input type="text" placeholder="19xxxxxx / NIYxx" required>
        </div>
        <div class="form-group full-width">
          <label>Nama Lengkap & Gelar</label>
          <input type="text" placeholder="Contoh: Dr. Ahmad Fauzi, M.Pd." required>
        </div>
        <div class="form-group">
          <label>Mata Pelajaran Utama</label>
          <select data-master="mapel" required>
            <option value="">-- Pilih Mapel --</option>
          </select>
        </div>
        <div class="form-group">
          <label>Status Kepegawaian</label>
          <select data-master="kepegawaian">
            <option value="">-- Pilih Status --</option>
          </select>
        </div>
        <div class="form-group">
          <label>No. Handphone / WhatsApp</label>
          <input type="text" placeholder="08xxxxxxxxxx">
        </div>
        <div class="form-group">
          <label>Email Utama</label>
          <input type="email" placeholder="guru@sekolah.sch.id">
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan Data Guru</button>
      </div>
    </form>
  `,

  jadwal: `
    <div class="section-title">
      <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      Manajemen Jadwal Mengajar & Alokasi Kelas
    </div>
    <form onsubmit="event.preventDefault();">
      <div class="form-grid">
        <div class="form-group">
          <label>Pilih Hari</label>
          <select required>
            <option value="Senin">Senin</option>
            <option value="Selasa">Selasa</option>
            <option value="Rabu">Rabu</option>
            <option value="Kamis">Kamis</option>
            <option value="Jumat">Jumat</option>
            <option value="Sabtu">Sabtu</option>
          </select>
        </div>
        <div class="form-group">
          <label>Jam Pelajaran Ke-</label>
          <select required>
            <option value="1-2">Jam 1 - 2 (07:00 - 08:30)</option>
            <option value="3-4">Jam 3 - 4 (08:30 - 10:00)</option>
            <option value="5-6">Jam 5 - 6 (10:15 - 11:45)</option>
            <option value="7-8">Jam 7 - 8 (12:30 - 14:00)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Pilih Guru Pengajar</label>
          <select required>
            <option value="">-- Pilih Guru --</option>
            <option value="1">Dr. Ahmad Fauzi, M.Pd.</option>
            <option value="2">Siti Nurhaliza, S.Pd.</option>
          </select>
        </div>
        <div class="form-group">
          <label>Pilih Mata Pelajaran</label>
          <select data-master="mapel" required>
            <option value="">-- Pilih Mapel --</option>
          </select>
        </div>
        <div class="form-group">
          <label>Pilih Kelas</label>
          <select data-master="kelas" required>
            <option value="">-- Pilih Kelas --</option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Tambah ke Matriks Jadwal</button>
      </div>
    </form>
  `,

  absensi: `
    <div class="section-title">
      <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      Input Presensi Siswa Real-Time (Per Jam Pelajaran)
    </div>
    <div class="form-grid" style="margin-bottom: 20px;">
      <div class="form-group">
        <label>Pilih Kelas Ajar Hari Ini</label>
        <select data-master="kelas">
          <option value="">-- Pilih Kelas --</option>
        </select>
      </div>
    </div>
  `,

  masterdata: `
    <div class="section-title">
      <svg viewBox="0 0 24 24"><path d="M12 2H2v10h10V2zM22 2h-8v6h8V2zM22 10h-8v12h8V10zM12 14H2v8h10v-8z"/></svg>
      Kelola Master Data Sekolah (Kustomisasi Mandiri)
    </div>
    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 24px;">
      Tambah atau hapus data master di bawah ini. Perubahan akan otomatis terintegrasi dan muncul di seluruh form aplikasi.
    </p>
    <div class="master-data-grid">
      <div class="master-card">
        <div class="master-card-header">
          <h3>Rombongan Belajar (Kelas)</h3>
        </div>
        <form onsubmit="handleAddMasterItem(event, 'kelas')" class="inline-add-form">
          <input type="text" id="inputMasterKelas" placeholder="Contoh: XII - IPA 2" required>
          <button type="submit" class="btn btn-primary btn-sm">+ Tambah</button>
        </form>
        <div class="master-list-container" id="listMasterKelas"></div>
      </div>

      <div class="master-card">
        <div class="master-card-header">
          <h3>Mata Pelajaran (Mapel)</h3>
        </div>
        <form onsubmit="handleAddMasterItem(event, 'mapel')" class="inline-add-form">
          <input type="text" id="inputMasterMapel" placeholder="Contoh: Informatika / AI" required>
          <button type="submit" class="btn btn-primary btn-sm">+ Tambah</button>
        </form>
        <div class="master-list-container" id="listMasterMapel"></div>
      </div>

      <div class="master-card">
        <div class="master-card-header">
          <h3>Status Kepegawaian Guru</h3>
        </div>
        <form onsubmit="handleAddMasterItem(event, 'kepegawaian')" class="inline-add-form">
          <input type="text" id="inputMasterKepegawaian" placeholder="Contoh: Guru Honor Daerah" required>
          <button type="submit" class="btn btn-primary btn-sm">+ Tambah</button>
        </form>
        <div class="master-list-container" id="listMasterKepegawaian"></div>
      </div>

      <div class="master-card">
        <div class="master-card-header">
          <h3>Jurusan / Program Keahlian</h3>
        </div>
        <form onsubmit="handleAddMasterItem(event, 'jurusan')" class="inline-add-form">
          <input type="text" id="inputMasterJurusan" placeholder="Contoh: Rekayasa Perangkat Lunak" required>
          <button type="submit" class="btn btn-primary btn-sm">+ Tambah</button>
        </form>
        <div class="master-list-container" id="listMasterJurusan"></div>
      </div>
    </div>
  `
};

async function loadPage(pageName) {
  const container = document.getElementById('mainContentContainer');
  if (!container) return;

  document.querySelectorAll('.sidebar .nav-item').forEach(btn => {
    btn.classList.remove('active');
  });

  const activeBtn = document.querySelector(`.sidebar .nav-item[data-page="${pageName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  try {
    const response = await fetch(`pages/${pageName}.html`);
    if (!response.ok) {
      throw new Error(`File pages/${pageName}.html tidak ditemukan.`);
    }
    const htmlContent = await response.text();
    container.innerHTML = htmlContent;
  } catch (error) {
    if (builtInTemplates[pageName]) {
      container.innerHTML = builtInTemplates[pageName];
    } else {
      container.innerHTML = `<p>Halaman tidak ditemukan.</p>`;
    }
  }

  // Eksekusi Render Khusus Modul Master Data
  if (pageName === 'masterdata' && typeof renderMasterDataUI === 'function') {
    renderMasterDataUI();
  }

  // Eksekusi Render Pengaturan
  if (pageName === 'pengaturan' && typeof loadSchoolSettings === 'function') {
    loadSchoolSettings();
  }

  // SINKRONISASI OTOMATIS: ISI SEMUA DROPDOWN KELAS/MAPEL/JURUSAN/STATUS
  if (typeof populateDynamicSelects === 'function') {
    populateDynamicSelects();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
});