// SISTEM AUTHENTICATION & SMART LOADER CADANGAN LENGKAP

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

const builtInTemplates = {
  dashboard: `
    <div id="dashboardBirthdayNotice"></div>
    <div class="section-title">
      <div class="section-title-left">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Dashboard Ringkasan Data Sekolah
      </div>
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

  guru: `
    <div class="section-title">
      <div class="section-title-left">
        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 1 3-3.87"/><circle cx="9" cy="7" r="4"/></svg>
        Database Master Guru & Tenaga Pendidik
      </div>
      <button type="button" class="btn btn-primary" onclick="openGuruModal()">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        + Tambah Guru Baru
      </button>
    </div>

    <div class="table-scroll-container">
      <table>
        <thead>
          <tr>
            <th style="width: 50px; text-align: center;">No</th>
            <th>NIP / NIY</th>
            <th>Nama Lengkap & Gelar</th>
            <th>Mata Pelajaran</th>
            <th>Status</th>
            <th>Tanggal Lahir</th>
            <th>Kontak</th>
            <th style="text-align: center; width: 100px;">Aksi</th>
          </tr>
        </thead>
        <tbody id="tableGuruBody"></tbody>
      </table>
    </div>

    <div class="modal-overlay hidden" id="modalGuru">
      <div class="modal-card">
        <div class="modal-header">
          <h3 id="modalGuruTitle">Tambah Data Guru Baru</h3>
          <button type="button" class="btn-close-modal" onclick="closeGuruModal()">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onsubmit="handleSaveGuru(event)">
          <input type="hidden" id="inputGuruEditId">
          <div class="form-grid">
            <div class="form-group">
              <label>NIP / NIY (Nomor Induk Guru)</label>
              <input type="text" id="inputNipGuru" placeholder="19xxxxxx / NIYxx" required>
            </div>
            <div class="form-group">
              <label>Tanggal Lahir Guru</label>
              <input type="date" id="inputTglLahirGuru" required>
            </div>
            <div class="form-group full-width">
              <label>Nama Lengkap & Gelar</label>
              <input type="text" id="inputNamaGuru" placeholder="Contoh: Dr. Ahmad Fauzi, M.Pd." required>
            </div>
            <div class="form-group">
              <label>Mata Pelajaran Utama</label>
              <select id="inputMapelGuru" data-master="mapel" required>
                <option value="">-- Pilih Mapel --</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status Kepegawaian</label>
              <select id="inputKepegawaianGuru" data-master="kepegawaian">
                <option value="">-- Pilih Status --</option>
              </select>
            </div>
            <div class="form-group">
              <label>No. Handphone / WhatsApp</label>
              <input type="text" id="inputHpGuru" placeholder="08xxxxxxxxxx">
            </div>
            <div class="form-group">
              <label>Email Utama</label>
              <input type="email" id="inputEmailGuru" placeholder="guru@sekolah.sch.id">
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeGuruModal()">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan Data Guru</button>
          </div>
        </form>
      </div>
    </div>
  `,

  siswa: `
    <div class="section-title">
      <div class="section-title-left">
        <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        Buku Induk Peserta Didik (Per Rombongan Belajar)
      </div>
      <button type="button" class="btn btn-primary" onclick="openAddSiswaModalGlobal()">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        + Tambah Siswa Baru
      </button>
    </div>

    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">
      Klik pada salah satu kartu kelas di bawah untuk melihat rincian detail murid pada kelas tersebut.
    </p>

    <div class="class-card-grid" id="classCardContainer"></div>

    <div class="modal-overlay hidden" id="modalSiswaDetail">
      <div class="modal-card" style="max-width: 850px;">
        <div class="modal-header">
          <h3 id="modalSiswaClassTitle">Detail Siswa Kelas</h3>
          <button type="button" class="btn-close-modal" onclick="closeSiswaDetailModal()">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="table-scroll-container" style="max-height: 420px;">
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">No</th>
                <th>NISN</th>
                <th>NIS</th>
                <th>Nama Lengkap Siswa</th>
                <th>Jurusan</th>
                <th style="text-align: center;">L/P</th>
                <th>Tempat, Tgl Lahir</th>
                <th style="text-align: center; width: 80px;">Aksi</th>
              </tr>
            </thead>
            <tbody id="tableSiswaBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal-overlay hidden" id="modalAddSiswaGlobal">
      <div class="modal-card" style="max-width: 700px;">
        <div class="modal-header">
          <h3>Input Data Siswa Baru Buku Induk</h3>
          <button type="button" class="btn-close-modal" onclick="closeAddSiswaModalGlobal()">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onsubmit="handleSaveSiswaGlobal(event)">
          <div class="form-grid">
            <div class="form-group">
              <label>Pilih Kelas / Rombongan Belajar</label>
              <select id="inputSiswaKelasGlobal" data-master="kelas" required>
                <option value="">-- Pilih Kelas --</option>
              </select>
            </div>
            <div class="form-group">
              <label>Jurusan / Program Keahlian</label>
              <select id="inputSiswaJurusanGlobal" data-master="jurusan" required>
                <option value="">-- Pilih Jurusan --</option>
              </select>
            </div>
            <div class="form-group">
              <label>NISN (Nomor Induk Siswa Nasional)</label>
              <input type="text" id="inputSiswaNisnGlobal" placeholder="0051234567" required>
            </div>
            <div class="form-group">
              <label>NIS (Nomor Induk Sekolah)</label>
              <input type="text" id="inputSiswaNisGlobal" placeholder="23241001" required>
            </div>
            <div class="form-group full-width">
              <label>Nama Lengkap Siswa</label>
              <input type="text" id="inputSiswaNamaGlobal" placeholder="Nama sesuai ijazah sebelumnya" required>
            </div>
            <div class="form-group">
              <label>Jenis Kelamin</label>
              <select id="inputSiswaJkGlobal" required>
                <option value="L">Laki-Laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tempat Lahir</label>
              <input type="text" id="inputSiswaTempatLahirGlobal" placeholder="Kota / Kabupaten">
            </div>
            <div class="form-group">
              <label>Tanggal Lahir</label>
              <input type="date" id="inputSiswaTglLahirGlobal">
            </div>
            <div class="form-group full-width">
              <label>NIK Siswa</label>
              <input type="text" id="inputSiswaNikGlobal" placeholder="16 Digit NIK sesuai KK">
            </div>
            <div class="form-group full-width">
              <label>Alamat Lengkap Siswa</label>
              <textarea id="inputSiswaAlamatGlobal" rows="2" placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeAddSiswaModalGlobal()">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan Data Siswa</button>
          </div>
        </form>
      </div>
    </div>
  `
};

async function loadPage(pageName) {
  const container = document.getElementById('mainContentContainer');
  if (!container) return;

  document.querySelectorAll('.sidebar .nav-item').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.sidebar .nav-item[data-page="${pageName}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  try {
    const response = await fetch(`pages/${pageName}.html`);
    if (!response.ok) throw new Error(`File pages/${pageName}.html tidak ditemukan.`);
    const htmlContent = await response.text();
    container.innerHTML = htmlContent;
  } catch (error) {
    if (builtInTemplates[pageName]) {
      container.innerHTML = builtInTemplates[pageName];
    } else {
      container.innerHTML = `<p>Halaman tidak ditemukan.</p>`;
    }
  }

  if (typeof populateDynamicSelects === 'function') {
    populateDynamicSelects();
  }

  if (pageName === 'dashboard' && typeof renderBirthdayWidget === 'function') {
    renderBirthdayWidget();
  }

  if (pageName === 'guru' && typeof renderGuruListUI === 'function') {
    renderGuruListUI();
  }

  if (pageName === 'siswa' && typeof renderClassCardsUI === 'function') {
    renderClassCardsUI();
  }

  if (pageName === 'masterdata' && typeof renderMasterDataUI === 'function') {
    renderMasterDataUI();
  }

  if (pageName === 'pengaturan' && typeof loadSchoolSettings === 'function') {
    loadSchoolSettings();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
});