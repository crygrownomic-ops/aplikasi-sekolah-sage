// SISTEM AUTHENTICATION & SMART LOADER CADANGAN LENGKAP (ANTI FAIL & AUTO CHECK)

function checkAuthStatus() {
  const isLoggedIn = sessionStorage.getItem('siakad_auth');
  const loginOverlay = document.getElementById('loginOverlay');

  if (isLoggedIn === 'true') {
    if (loginOverlay) loginOverlay.classList.add('hidden');
    const lastPage = localStorage.getItem('active_page') || 'dashboard';
    loadPage(lastPage);
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
    const lastPage = localStorage.getItem('active_page') || 'dashboard';
    loadPage(lastPage);
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

// BUILT-IN TEMPLATES LENGKAP CADANGAN (JIKA FILE HTML KOSONG / TERPOTONG / MISSING)
const builtInTemplates = {
  dashboard: `
    <!-- BANNER UCAPAN ULANG TAHUN DYNAMIC -->
    <div id="dashboardBirthdayNotice"></div>

    <!-- TITLE & HEADER DASHBOARD -->
    <div class="section-title">
      <div class="section-title-left">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Dashboard Ringkasan & Pusat Kendali Sekolah
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="background: var(--accent-soft); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; color: var(--primary);" id="displayAcademicPeriod">TA 2026/2027 - Ganjil</span>
        <div style="font-size: 13px; color: var(--text-muted); font-weight: 600;" id="dashTodayDate"></div>
      </div>
    </div>

    <!-- METRICS STATISTIK UTAMA (AUTO RECALCULATE) -->
    <div class="dashboard-metrics-grid">
      <div class="metric-card" onclick="loadPage('siswa')" style="cursor: pointer;" title="Klik untuk lihat Buku Induk Siswa">
        <div class="metric-icon" style="background-color: var(--accent-soft);">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 1 3-3.87"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <div class="metric-info">
          <h3>Total Siswa Aktif</h3>
          <p class="metric-number" id="dashCountSiswa">0</p>
          <span class="metric-sub">Terdaftar di Buku Induk (Form 8355)</span>
        </div>
      </div>

      <div class="metric-card" onclick="loadPage('guru')" style="cursor: pointer;" title="Klik untuk lihat Master Guru">
        <div class="metric-icon" style="background-color: var(--accent-soft);">
          <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="metric-info">
          <h3>Tenaga Pendidik (Guru)</h3>
          <p class="metric-number" id="dashCountGuru">0</p>
          <span class="metric-sub">Guru & Staf Terdaftar</span>
        </div>
      </div>

      <div class="metric-card" onclick="loadPage('masterdata')" style="cursor: pointer;" title="Klik untuk lihat Kelola Master Data">
        <div class="metric-icon" style="background-color: var(--accent-soft);">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="metric-info">
          <h3>Rombongan Belajar</h3>
          <p class="metric-number" id="dashCountKelas">0</p>
          <span class="metric-sub">Kelas Aktif Dikelola</span>
        </div>
      </div>

      <div class="metric-card" onclick="loadPage('absensi')" style="cursor: pointer;" title="Klik untuk Kelola Presensi">
        <div class="metric-icon" style="background-color: var(--accent-soft);">
          <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <div class="metric-info">
          <h3>Presensi Hari Ini</h3>
          <p class="metric-number" id="dashPresensiPercent">0%</p>
          <span class="metric-sub" id="dashPresensiSub">Belum ada input presensi</span>
        </div>
      </div>
    </div>

    <!-- SPLIT GRID: JADWAL HARI INI & PINTASAN APLIKASI -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 24px;">
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="background: var(--card-bg); border: 1px solid var(--border-color); padding: 20px; border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 14px; font-weight: 700; color: var(--text-main);">Rata-Rata Kehadiran Siswa (Senin - Sabtu)</h3>
            <button type="button" class="btn btn-secondary" onclick="loadPage('absensi')" style="font-size: 11px; padding: 4px 8px;">Detail Presensi →</button>
          </div>
          <div id="dashAttendanceChart"></div>
        </div>

        <div style="background: var(--card-bg); border: 1px solid var(--border-color); padding: 20px; border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
              <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; stroke: var(--primary); fill: none; stroke-width: 2;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Jadwal Pelajaran Hari Ini (<span id="dashTodayName">-</span>)
            </h3>
            <button type="button" class="btn btn-secondary" onclick="loadPage('jadwal')" style="font-size: 12px; padding: 4px 10px;">
              Kelola Jadwal →
            </button>
          </div>
          <div class="table-scroll-container" style="max-height: 280px;">
            <table>
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">No</th>
                  <th>Jam Pelajaran</th>
                  <th>Kelas</th>
                  <th>Mata Pelajaran</th>
                  <th>Guru Pengajar</th>
                </tr>
              </thead>
              <tbody id="dashTableJadwalHariIni"></tbody>
            </table>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="background: var(--card-bg); border: 1px solid var(--border-color); padding: 20px; border-radius: 12px;">
          <h3 style="font-size: 14px; font-weight: 700; color: var(--text-main); margin-bottom: 14px;">Akses Cepat Modul</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button type="button" class="btn btn-secondary" onclick="loadPage('siswa')" style="justify-content: flex-start; text-align: left; padding: 10px;">📖 Buku Induk</button>
            <button type="button" class="btn btn-secondary" onclick="loadPage('kartusiswa')" style="justify-content: flex-start; text-align: left; padding: 10px;">🎴 Kartu Siswa</button>
            <button type="button" class="btn btn-secondary" onclick="loadPage('guru')" style="justify-content: flex-start; text-align: left; padding: 10px;">👨‍🏫 Master Guru</button>
            <button type="button" class="btn btn-secondary" onclick="loadPage('absensi')" style="justify-content: flex-start; text-align: left; padding: 10px;">✅ Presensi Siswa</button>
          </div>
        </div>

        <div style="background: var(--input-bg); border: 1px solid var(--border-color); padding: 18px; border-radius: 12px;">
          <h4 style="font-size: 13px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">🔒 Proteksi Data Harddisk</h4>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-bottom: 10px;">
            Penyimpanan terhubung secara lokal. Data tersimpan otomatis dan kebal terhadap pembersihan cache browser.
          </p>
          <button type="button" class="btn btn-secondary" onclick="loadPage('pengaturan')" style="width: 100%; font-size: 12px;">
            Pengaturan Backup & Sinkronisasi
          </button>
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
      <div class="header-action-btns">
        <input type="text" placeholder="🔍 Cari nama / NIP guru..." onkeyup="searchGuruTable(this.value)" style="padding: 8px 12px; font-size: 12px; border-radius: 6px; border: 1px solid var(--border-color); width: 220px; background: var(--card-bg); color: var(--text-main);">
        <button type="button" class="btn btn-secondary" onclick="downloadGuruExcelTemplate()">↓ Template Excel (.xlsx)</button>
        <label class="btn btn-secondary" style="cursor: pointer;">
          ↑ Import Excel
          <input type="file" accept=".xlsx, .xls" onchange="importGuruExcel(event)" style="display: none;">
        </label>
        <button type="button" class="btn btn-primary" onclick="openGuruModal()">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          + Tambah Guru
        </button>
      </div>
    </div>
    <div class="table-scroll-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">No</th>
            <th>Nama Lengkap</th>
            <th>NIP / NUPTK</th>
            <th>Mapel Utama</th>
            <th>Pendidikan</th>
            <th>Pangkat / Gol.</th>
            <th>Sertifikasi</th>
            <th style="text-align: center; width: 90px;">Aksi</th>
          </tr>
        </thead>
        <tbody id="tableGuruBody"></tbody>
      </table>
    </div>
    <div class="modal-overlay hidden" id="modalGuru">
      <div class="modal-card" style="max-width: 820px;">
        <div class="modal-header">
          <h3 id="modalGuruTitle">Tambah Data Guru Baru</h3>
          <button type="button" class="btn-close-modal" onclick="closeGuruModal()">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onsubmit="handleSaveGuru(event)">
          <input type="hidden" id="inputGuruEditId">
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Nama Lengkap & Gelar</label>
              <input type="text" id="inputNamaGuru" placeholder="Dr. Ahmad Fauzi, M.Pd." required>
            </div>
            <div class="form-group">
              <label>NIP (Nomor Induk Pegawai)</label>
              <input type="text" id="inputNipGuru" placeholder="198xxxxxxxxx">
            </div>
            <div class="form-group">
              <label>NUPTK</label>
              <input type="text" id="inputNuptkGuru" placeholder="16 Digit NUPTK">
            </div>
            <div class="form-group">
              <label>Tempat Lahir</label>
              <input type="text" id="inputTempatLahirGuru" placeholder="Kota / Kabupaten">
            </div>
            <div class="form-group">
              <label>Tanggal Lahir</label>
              <input type="date" id="inputTglLahirGuru" required>
            </div>
            <div class="form-group">
              <label>Jenis Kelamin</label>
              <select id="inputJkGuru" required>
                <option value="L">Laki-Laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div class="form-group">
              <label>Agama</label>
              <select id="inputAgamaGuru">
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Khonghucu">Khonghucu</option>
              </select>
            </div>
            <div class="form-group">
              <label>Ijazah Pendidikan Terakhir</label>
              <input type="text" id="inputIjazahGuru" placeholder="S1 Pendidikan Matematika">
            </div>
            <div class="form-group">
              <label>Tahun Lulus Ijazah</label>
              <input type="number" id="inputTahunIjazahGuru" placeholder="2012">
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
              <label>Jabatan</label>
              <input type="text" id="inputJabatanGuru" placeholder="Guru Ahli Muda">
            </div>
            <div class="form-group">
              <label>Pangkat / Golongan</label>
              <input type="text" id="inputPangkatGolGuru" placeholder="Penata Muda / III-a">
            </div>
            <div class="form-group">
              <label>TMT Golongan</label>
              <input type="date" id="inputTmtGuru">
            </div>
            <div class="form-group">
              <label>Masa Kerja Golongan</label>
              <input type="text" id="inputMasaKerjaGuru" placeholder="12 Tahun 4 Bulan">
            </div>
            <div class="form-group">
              <label>Pengangkat TMT Sekolah Ini</label>
              <input type="date" id="inputTmtSekolahGuru">
            </div>
            <div class="form-group">
              <label>Status Sertifikasi</label>
              <select id="inputSertifikasiGuru">
                <option value="Belum">Belum Sertifikasi</option>
                <option value="Sudah">Sudah Sertifikasi</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tahun Sertifikasi</label>
              <input type="number" id="inputTahunSertifikasiGuru" placeholder="2018">
            </div>
            <div class="form-group">
              <label>No. Rekening Bank</label>
              <input type="text" id="inputNoRekeningGuru" placeholder="Bank Kalbar / Mandiri">
            </div>
            <div class="form-group">
              <label>No. HP / WA</label>
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
        Buku Induk Peserta Didik (Form 8355 Standar)
      </div>
      <div class="header-action-btns">
        <input type="text" placeholder="🔍 Cari nama / NISN..." onkeyup="searchSiswaTable(this.value)" style="padding: 8px 12px; font-size: 12px; border-radius: 6px; border: 1px solid var(--border-color); width: 200px; background: var(--card-bg); color: var(--text-main);">
        <button type="button" class="btn btn-secondary" onclick="downloadSiswaExcelTemplate()">↓ Template Excel (.xlsx)</button>
        <label class="btn btn-secondary" style="cursor: pointer;">
          ↑ Import Excel
          <input type="file" accept=".xlsx, .xls" onchange="importSiswaExcel(event)" style="display: none;">
        </label>
        <button type="button" class="btn btn-primary" onclick="openAddSiswaModalGlobal()">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          + Tambah Siswa Baru
        </button>
      </div>
    </div>
    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">
      Klik pada salah satu kartu kelas di bawah untuk melihat rincian detail murid pada kelas tersebut.
    </p>
    <div class="class-card-grid" id="classCardContainer"></div>

    <div class="modal-overlay hidden" id="modalSiswaDetail">
      <div class="modal-card" style="max-width: 900px;">
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
                <th>NISN / NIS</th>
                <th>Nama Lengkap Siswa</th>
                <th>Jurusan</th>
                <th style="text-align: center;">L/P</th>
                <th>Ortu (Ayah/Ibu)</th>
                <th>Kontak HP</th>
                <th style="text-align: center; width: 80px;">Aksi</th>
              </tr>
            </thead>
            <tbody id="tableSiswaBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal-overlay hidden" id="modalAddSiswaGlobal">
      <div class="modal-card" style="max-width: 780px;">
        <div class="modal-header">
          <h3>Input Data Siswa Baru (Biodata Form 8355)</h3>
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
              <label>Agama Siswa</label>
              <select id="inputSiswaAgamaGlobal">
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Khonghucu">Khonghucu</option>
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
            <div class="form-group">
              <label>NIK Siswa</label>
              <input type="text" id="inputSiswaNikGlobal" placeholder="16 Digit NIK sesuai KK">
            </div>
            <div class="form-group">
              <label>No. HP Siswa / WhatsApp</label>
              <input type="text" id="inputSiswaHpGlobal" placeholder="08xxxxxxxxxx">
            </div>
            <div class="form-group">
              <label>Nama Ayah Kandung</label>
              <input type="text" id="inputSiswaAyahGlobal" placeholder="Nama Ayah">
            </div>
            <div class="form-group">
              <label>Nama Ibu Kandung</label>
              <input type="text" id="inputSiswaIbuGlobal" placeholder="Nama Ibu">
            </div>
            <div class="form-group full-width">
              <label>Pekerjaan Orang Tua / Wali</label>
              <input type="text" id="inputSiswaPekerjaanOrtuGlobal" placeholder="PNS / Swasta / Wiraswasta">
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
  `,

  kartusiswa: `
    <div class="section-title">
      <div class="section-title-left">
        <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="10" r="3"/><path d="M14 10h4M14 14h4M4 18c0-2 2-3 4-3s4 1 4 3"/></svg>
        Cetak & Generator Kartu Tanda Siswa (Dilengkapi Barcode)
      </div>
      <button type="button" class="btn btn-primary" onclick="window.print()">
        <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 0-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Cetak Kartu Siswa
      </button>
    </div>
    <div class="form-grid" style="margin-bottom: 24px; align-items: center;">
      <div class="form-group">
        <label>Filter Berdasarkan Kelas</label>
        <select id="selectClassKartu" data-master="kelas" onchange="renderStudentCardsUI()">
          <option value="">-- Semua Kelas --</option>
        </select>
      </div>
      <p style="font-size: 13px; color: var(--text-muted); grid-column: 1 / -1;">
        Pilih kelas di atas untuk menyaring siswa. Kartu siswa otomatis dilengkapi barcode NISN/NIS untuk pemindaian presensi.
      </p>
    </div>
    <div class="student-id-cards-grid" id="studentCardContainer"></div>
  `,

  jadwal: `
    <div class="section-title">
      <div class="section-title-left">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Manajemen Jadwal Mengajar & Alokasi Kelas
      </div>
    </div>
    <form onsubmit="handleSaveJadwal(event)" style="background: var(--input-bg); border: 1px solid var(--border-color); padding: 18px; border-radius: 12px; margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--text-main);">+ Tambah Alokasi Jadwal Baru</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Pilih Hari</label>
          <select id="inputJadwalHari" required>
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
          <select id="inputJadwalJam" required>
            <option value="Jam 1 - 2 (07:00 - 08:30)">Jam 1 - 2 (07:00 - 08:30)</option>
            <option value="Jam 3 - 4 (08:30 - 10:00)">Jam 3 - 4 (08:30 - 10:00)</option>
            <option value="Jam 5 - 6 (10:15 - 11:45)">Jam 5 - 6 (10:15 - 11:45)</option>
            <option value="Jam 7 - 8 (12:30 - 14:00)">Jam 7 - 8 (12:30 - 14:00)</option>
            <option value="Jam 9 - 10 (14:00 - 15:30)">Jam 9 - 10 (14:00 - 15:30)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Pilih Guru Pengajar</label>
          <select id="inputJadwalGuru" data-master="guru" required>
            <option value="">-- Pilih Guru --</option>
          </select>
        </div>
        <div class="form-group">
          <label>Pilih Mata Pelajaran</label>
          <select id="inputJadwalMapel" data-master="mapel" required>
            <option value="">-- Pilih Mapel --</option>
          </select>
        </div>
        <div class="form-group">
          <label>Pilih Kelas</label>
          <select id="inputJadwalKelas" data-master="kelas" required>
            <option value="">-- Pilih Kelas --</option>
          </select>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
        <button type="submit" class="btn btn-primary">Simpan ke Matriks Jadwal</button>
      </div>
    </form>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
      <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main);">Matriks Matapel & Jam Mengajar</h3>
      <div style="display: flex; gap: 10px; align-items: center;">
        <label style="font-size: 12px; font-weight: 600; color: var(--text-muted);">Filter Tampilan:</label>
        <select id="filterJadwalKelas" data-master="kelas" onchange="renderJadwalTableUI()" style="padding: 6px 10px; font-size: 12px;">
          <option value="">-- Semua Kelas --</option>
        </select>
        <select id="filterJadwalHari" onchange="renderJadwalTableUI()" style="padding: 6px 10px; font-size: 12px;">
          <option value="">-- Semua Hari --</option>
          <option value="Senin">Senin</option>
          <option value="Selasa">Selasa</option>
          <option value="Rabu">Rabu</option>
          <option value="Kamis">Kamis</option>
          <option value="Jumat">Jumat</option>
          <option value="Sabtu">Sabtu</option>
        </select>
      </div>
    </div>
    <div class="table-scroll-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">No</th>
            <th>Hari</th>
            <th>Jam Pelajaran</th>
            <th>Kelas</th>
            <th>Mata Pelajaran</th>
            <th>Guru Pengajar</th>
            <th style="text-align: center; width: 80px;">Aksi</th>
          </tr>
        </thead>
        <tbody id="tableJadwalBody"></tbody>
      </table>
    </div>
  `,

  absensi: `
    <div class="section-title">
      <div class="section-title-left">
        <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        Presensi & Kehadiran Peserta Didik
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <button type="button" class="btn btn-secondary" onclick="exportPresensiBulananExcel()">
          ↓ Export Rekap Bulanan (.xlsx)
        </button>
        <button type="button" class="btn btn-secondary" onclick="window.print()">
          <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 0-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Cetak Rekap Presensi
        </button>
      </div>
    </div>

    <div style="background: var(--input-bg); border: 1px solid var(--border-color); padding: 18px; border-radius: 12px; margin-bottom: 20px;">
      <div class="form-grid" style="align-items: flex-end;">
        <div class="form-group">
          <label>Pilih Rombongan Belajar (Kelas)</label>
          <select id="selectAbsensiKelas" data-master="kelas" onchange="renderAbsensiTableUI()">
            <option value="">-- Pilih Kelas --</option>
          </select>
        </div>
        <div class="form-group">
          <label>Tanggal Presensi</label>
          <input type="date" id="inputAbsensiTanggal" onchange="renderAbsensiTableUI()">
        </div>
        <div class="form-group">
          <label>Mata Pelajaran (Opsional)</label>
          <select id="selectAbsensiMapel" data-master="mapel">
            <option value="">-- Semua Mata Pelajaran / Harian --</option>
          </select>
        </div>
      </div>
    </div>

    <div class="dashboard-metrics-grid" style="margin-bottom: 20px;">
      <div class="metric-card" style="padding: 12px 16px;">
        <div class="metric-info">
          <h3 style="font-size: 11px;">Hadir (H)</h3>
          <p class="metric-number" id="countHadir" style="font-size: 20px; color: #10B981;">0</p>
        </div>
      </div>
      <div class="metric-card" style="padding: 12px 16px;">
        <div class="metric-info">
          <h3 style="font-size: 11px;">Sakit (S)</h3>
          <p class="metric-number" id="countSakit" style="font-size: 20px; color: #F59E0B;">0</p>
        </div>
      </div>
      <div class="metric-card" style="padding: 12px 16px;">
        <div class="metric-info">
          <h3 style="font-size: 11px;">Izin (I)</h3>
          <p class="metric-number" id="countIzin" style="font-size: 20px; color: #3B82F6;">0</p>
        </div>
      </div>
      <div class="metric-card" style="padding: 12px 16px;">
        <div class="metric-info">
          <h3 style="font-size: 11px;">Alpa (A)</h3>
          <p class="metric-number" id="countAlpa" style="font-size: 20px; color: #EF4444;">0</p>
        </div>
      </div>
    </div>

    <form onsubmit="handleSaveAbsensi(event)">
      <div class="table-scroll-container" style="margin-bottom: 20px;">
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">No</th>
              <th>NISN / NIS</th>
              <th>Nama Lengkap Siswa</th>
              <th style="text-align: center; width: 60px;">L/P</th>
              <th style="text-align: center; width: 320px;">Status Kehadiran</th>
              <th>Catatan / Keterangan</th>
            </tr>
          </thead>
          <tbody id="tableAbsensiBody"></tbody>
        </table>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button type="submit" class="btn btn-primary" style="padding: 10px 24px; font-weight: 700;">
          ✓ Simpan Data Presensi
        </button>
      </div>
    </form>
  `,

  nilai: `
    <div class="section-title">
      <div class="section-title-left">
        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        Modul Penilaian & Capaian Rapor Siswa
      </div>
    </div>
    <div style="background: var(--input-bg); border: 1px solid var(--border-color); padding: 18px; border-radius: 12px; margin-bottom: 20px;">
      <div class="form-grid" style="align-items: flex-end;">
        <div class="form-group">
          <label>Pilih Kelas</label>
          <select id="selectNilaiKelas" data-master="kelas" onchange="renderNilaiTableUI()">
            <option value="">-- Pilih Kelas --</option>
          </select>
        </div>
        <div class="form-group">
          <label>Pilih Mata Pelajaran</label>
          <select id="selectNilaiMapel" data-master="mapel" onchange="renderNilaiTableUI()">
            <option value="">-- Pilih Mapel --</option>
          </select>
        </div>
      </div>
    </div>
    <form onsubmit="handleSaveNilai(event)">
      <div class="table-scroll-container" style="margin-bottom: 20px;">
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">No</th>
              <th>NISN</th>
              <th>Nama Lengkap Siswa</th>
              <th style="width: 100px;">Nilai Tugas (30%)</th>
              <th style="width: 100px;">Nilai UTS (30%)</th>
              <th style="width: 100px;">Nilai UAS (40%)</th>
              <th style="width: 90px; text-align: center;">Nilai Akhir</th>
              <th style="width: 80px; text-align: center;">Predikat</th>
            </tr>
          </thead>
          <tbody id="tableNilaiBody"></tbody>
        </table>
      </div>
      <div style="display: flex; justify-content: flex-end;">
        <button type="submit" class="btn btn-primary" style="padding: 10px 24px; font-weight: 700;">
          Simpan Nilai Rapor
        </button>
      </div>
    </form>
  `,

  jurnal: `
    <div class="section-title">
      <div class="section-title-left">
        <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        Agenda & Jurnal Mengajar Harian Guru
      </div>
    </div>
    <form onsubmit="handleSaveJurnal(event)" style="background: var(--input-bg); border: 1px solid var(--border-color); padding: 18px; border-radius: 12px; margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--text-main);">+ Catat Agenda Mengajar Hari Ini</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Tanggal Mengajar</label>
          <input type="date" id="inputJurnalTanggal" required>
        </div>
        <div class="form-group">
          <label>Guru Pengajar</label>
          <select id="selectJurnalGuru" data-master="guru" required>
            <option value="">-- Pilih Guru --</option>
          </select>
        </div>
        <div class="form-group">
          <label>Kelas</label>
          <select id="selectJurnalKelas" data-master="kelas" required>
            <option value="">-- Pilih Kelas --</option>
          </select>
        </div>
        <div class="form-group">
          <label>Mata Pelajaran</label>
          <select id="selectJurnalMapel" data-master="mapel" required>
            <option value="">-- Pilih Mapel --</option>
          </select>
        </div>
        <div class="form-group full-width">
          <label>Materi / Pokok Bahasan Yang Disampaikan</label>
          <input type="text" id="inputJurnalMateri" placeholder="Contoh: Bab 3 - Persamaan Kuadrat dan Pembahasan Soal" required>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
        <button type="submit" class="btn btn-primary">Simpan Agenda Jurnal</button>
      </div>
    </form>
    <div class="table-scroll-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">No</th>
            <th>Tanggal</th>
            <th>Guru Pengajar</th>
            <th>Kelas</th>
            <th>Mata Pelajaran</th>
            <th>Materi Disampaikan</th>
            <th style="text-align: center; width: 80px;">Aksi</th>
          </tr>
        </thead>
        <tbody id="tableJurnalBody"></tbody>
      </table>
    </div>
  `,

  demografi: `
    <div class="section-title">
      <div class="section-title-left">
        <svg viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
        Demografi Siswa & Laporan Resmi Akreditasi
      </div>
      <button type="button" class="btn btn-primary" onclick="exportForm8355Excel()">
        ↓ Export Form 8355 Resmi (.xlsx)
      </button>
    </div>
    <div id="demografiContainer"></div>
  `,

  masterdata: `
    <div class="section-title">
      <div class="section-title-left">
        <svg viewBox="0 0 24 24"><path d="M12 2H2v10h10V2zM22 2H12v10h10V2zM12 12H2v10h10V12zM22 12H12v10h10V12z"/></svg>
        Kelola Master Data Referensi Aplikasi
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
      <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 18px;">
        <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">Master Rombongan Belajar (Kelas)</h3>
        <form onsubmit="handleAddMasterItem(event, 'kelas')" style="display: flex; gap: 8px; margin-bottom: 12px;">
          <input type="text" id="inputMasterKelas" placeholder="Contoh: XII - IPA 2" required style="font-size: 12px; padding: 6px 10px;">
          <button type="submit" class="btn btn-primary" style="padding: 6px 12px; font-size: 12px;">+ Tambah</button>
        </form>
        <div id="listMasterKelas"></div>
      </div>

      <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 18px;">
        <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">Master Mata Pelajaran</h3>
        <form onsubmit="handleAddMasterItem(event, 'mapel')" style="display: flex; gap: 8px; margin-bottom: 12px;">
          <input type="text" id="inputMasterMapel" placeholder="Contoh: Sosiologi" required style="font-size: 12px; padding: 6px 10px;">
          <button type="submit" class="btn btn-primary" style="padding: 6px 12px; font-size: 12px;">+ Tambah</button>
        </form>
        <div id="listMasterMapel"></div>
      </div>

      <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 18px;">
        <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">Master Status Kepegawaian</h3>
        <form onsubmit="handleAddMasterItem(event, 'kepegawaian')" style="display: flex; gap: 8px; margin-bottom: 12px;">
          <input type="text" id="inputMasterKepegawaian" placeholder="Contoh: Honor Daerah" required style="font-size: 12px; padding: 6px 10px;">
          <button type="submit" class="btn btn-primary" style="padding: 6px 12px; font-size: 12px;">+ Tambah</button>
        </form>
        <div id="listMasterKepegawaian"></div>
      </div>

      <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 18px;">
        <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">Master Jurusan / Keahlian</h3>
        <form onsubmit="handleAddMasterItem(event, 'jurusan')" style="display: flex; gap: 8px; margin-bottom: 12px;">
          <input type="text" id="inputMasterJurusan" placeholder="Contoh: Rekayasa Perangkat Lunak" required style="font-size: 12px; padding: 6px 10px;">
          <button type="submit" class="btn btn-primary" style="padding: 6px 12px; font-size: 12px;">+ Tambah</button>
        </form>
        <div id="listMasterJurusan"></div>
      </div>
    </div>
  `,

  pengaturan: `
    <div class="section-title">
      <div class="section-title-left">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Pengaturan Sistem & Keamanan Database
      </div>
    </div>

    <form onsubmit="saveSchoolProfile(event)" style="margin-bottom: 28px;">
      <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: var(--text-main);">Identitas Utama Sekolah</h3>
      <div class="form-grid">
        <div class="form-group full-width">
          <label>Nama Resmi Sekolah</label>
          <input type="text" id="inputNamaSekolah" placeholder="SMA Negeri 1 Digital" required>
        </div>
        <div class="form-group">
          <label>Email Resmi Sekolah</label>
          <input type="email" id="inputEmailSekolah" placeholder="info@sekolah.sch.id" required>
        </div>
        <div class="form-group">
          <label>Nomor Telepon Sekolah</label>
          <input type="text" id="inputTelpSekolah" placeholder="(021) 555-0192" required>
        </div>
        <div class="form-group full-width">
          <label>Upload Logo Sekolah</label>
          <input type="file" accept="image/*" onchange="handleLogoUpload(event)">
        </div>
      </div>
      <div class="form-actions" style="border-top: none; padding-top: 10px;">
        <button type="submit" class="btn btn-primary">Simpan Profil Sekolah</button>
      </div>
    </form>

    <form onsubmit="saveAcademicPeriod(event)" style="border-top: 1px solid var(--border-color); margin-bottom: 28px; padding-top: 20px;">
      <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 6px; color: var(--text-main);">Periode Akademik & Tahun Ajaran Aktif</h3>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
        Atur dan perbarui Tahun Ajaran serta Semester aktif secara mandiri agar penggunaan aplikasi dapat berjalan jangka panjang.
      </p>
      <div class="form-grid">
        <div class="form-group">
          <label>Tahun Ajaran (Contoh: 2026/2027)</label>
          <input type="text" id="inputTahunAjaran" placeholder="2026/2027" required>
        </div>
        <div class="form-group">
          <label>Semester Aktif</label>
          <select id="selectSemester" required>
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </select>
        </div>
      </div>
      <div class="form-actions" style="border-top: none; padding-top: 10px;">
        <button type="submit" class="btn btn-primary">Simpan Periode Akademik</button>
      </div>
    </form>

    <div style="border-top: 1px solid var(--border-color); margin-bottom: 28px; padding-top: 20px;">
      <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 6px; color: var(--text-main);">Penyimpanan Harddisk Lokal & Proteksi Anti-Hapus</h3>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
        Hubungkan folder komputer agar backup terisi otomatis dan kunci browser agar data kebal dari pembersihan cache.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 20px;">
        <div style="background: var(--input-bg); border: 1px solid var(--border-color); padding: 16px; border-radius: 12px;">
          <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">📁 Folder Penyimpanan Komputer</h4>
          <p id="folderStatusText" style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">Belum ada folder yang terhubung.</p>
          <button type="button" class="btn btn-secondary" onclick="selectLocalDirectory()">Pilih Folder di Laptop (D:/ atau C:/)</button>
        </div>
        <div style="background: var(--input-bg); border: 1px solid var(--border-color); padding: 16px; border-radius: 12px;">
          <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">🛡️ Proteksi Memori Browser</h4>
          <p id="persistenceStatus" style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 12px;">Mengecek status kuncian memori...</p>
          <button type="button" class="btn btn-secondary" onclick="enablePersistentStorage()">Kunci Data agar Kebal Clear Cache</button>
        </div>
      </div>
      <div style="background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 18px;">
        <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 4px; color: var(--text-main);">Cadangan Manual (JSON File)</h4>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">Unduh atau muat ulang file cadangan database SIAKAD kapan saja.</p>
        <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
          <button type="button" class="btn btn-primary" onclick="exportDatabaseJSON()">📥 Download Backup Database (.json)</button>
          <label class="btn btn-secondary" style="cursor: pointer;">
            📤 Import / Restore Database
            <input type="file" accept=".json" onchange="importDatabaseJSON(event)" style="display: none;">
          </label>
          <button type="button" class="btn btn-secondary" onclick="resetDatabaseToDefault()" style="color: #EF4444; border-color: #FCA5A5; margin-left: auto;">⚠️ Reset Database (Pabrik)</button>
        </div>
      </div>
    </div>

    <div style="border-top: 1px solid var(--border-color); margin-bottom: 28px; padding-top: 20px;">
      <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 6px; color: var(--text-main);">Database Cloud Online (Supabase Optional)</h3>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Aktifkan jika ingin menyinkronkan data ke server cloud online.</p>
      <div class="form-grid" style="margin-bottom: 16px;">
        <div class="form-group full-width">
          <label>Mode Penyimpanan Utama</label>
          <select id="selectStorageMode" onchange="toggleStorageModeUI()">
            <option value="local">Mode Offline (Penyimpanan Komputer Lokal)</option>
            <option value="supabase">Mode Online (Supabase Cloud Database)</option>
          </select>
        </div>
      </div>
      <div id="supabaseConfigContainer" style="display: none; background: var(--input-bg); padding: 16px; border-radius: 12px; border: 1px solid var(--border-color);">
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Supabase Project URL</label>
            <input type="text" id="inputSupabaseUrl" placeholder="https://xyzcompany.supabase.co">
          </div>
          <div class="form-group full-width">
            <label>Supabase Anon Key</label>
            <input type="password" id="inputSupabaseKey" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
          </div>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 12px;">
          <button type="button" class="btn btn-secondary" onclick="DB.migrateLocalToSupabase()">☁️ Sync / Upload Data Lokal ke Supabase</button>
          <button type="button" class="btn btn-primary" onclick="saveSupabaseConfig()">Simpan Kredensial Supabase</button>
        </div>
      </div>
    </div>

    <div style="border-top: 1px solid var(--border-color); padding-top: 20px;">
      <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 6px; color: var(--text-main);">Pilihan Tema Warna Tampilan</h3>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">Klik pada salah satu kartu warna di bawah. Tampilan warna aplikasi akan langsung berganti seketika!</p>
      <div class="theme-selector-grid">
        <div class="theme-card" data-theme-name="sage" onclick="setTheme('sage')"><div class="theme-color-preview" style="background: #2E4F4F;"></div>Sage Green</div>
        <div class="theme-card" data-theme-name="navy" onclick="setTheme('navy')"><div class="theme-color-preview" style="background: #1E293B;"></div>Classic Navy</div>
        <div class="theme-card" data-theme-name="emerald" onclick="setTheme('emerald')"><div class="theme-color-preview" style="background: #065F46;"></div>Emerald Green</div>
        <div class="theme-card" data-theme-name="monochrome" onclick="setTheme('monochrome')"><div class="theme-color-preview" style="background: #18181B;"></div>Monochrome</div>
        <div class="theme-card" data-theme-name="amber" onclick="setTheme('amber')"><div class="theme-color-preview" style="background: #78350F;"></div>Warm Amber</div>
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

  localStorage.setItem('active_page', pageName);

  try {
    const response = await fetch(`pages/${pageName}.html`);
    if (!response.ok) throw new Error(`File pages/${pageName}.html tidak ditemukan.`);
    const htmlContent = await response.text();

    // VERIFIKASI KEUTUHAN ISI FILE
    if (!htmlContent.trim()) throw new Error("File HTML kosong.");
    if (pageName === 'siswa' && !htmlContent.includes('inputSiswaNamaGlobal')) throw new Error("Form siswa terpotong.");
    if (pageName === 'kartusiswa' && !htmlContent.includes('studentCardContainer')) throw new Error("Container kartu terpotong.");
    if (pageName === 'jadwal' && !htmlContent.includes('tableJadwalBody')) throw new Error("Container jadwal terpotong.");
    if (pageName === 'absensi' && !htmlContent.includes('tableAbsensiBody')) throw new Error("Container presensi terpotong.");
    if (pageName === 'nilai' && !htmlContent.includes('tableNilaiBody')) throw new Error("Container nilai terpotong.");
    if (pageName === 'jurnal' && !htmlContent.includes('tableJurnalBody')) throw new Error("Container jurnal terpotong.");
    if (pageName === 'demografi' && !htmlContent.includes('demografiContainer')) throw new Error("Container demografi terpotong.");

    container.innerHTML = htmlContent;
  } catch (error) {
    // FALLBACK KE TEMPLATE BAWAAN JS JIKA FILE GAGAL DIBUAT/DIBACA
    if (builtInTemplates[pageName]) {
      container.innerHTML = builtInTemplates[pageName];
    } else {
      container.innerHTML = `<p style="padding: 20px; color: var(--text-muted);">Halaman tidak ditemukan.</p>`;
    }
  }

  // JALANKAN FUNGSI RE-RENDER ELEMEN SECARA PRESISI
  if (typeof populateDynamicSelects === 'function') {
    populateDynamicSelects();
  }

  if (pageName === 'dashboard') {
    if (typeof renderDashboardUI === 'function') {
      renderDashboardUI();
    } else if (typeof renderBirthdayWidget === 'function') {
      renderBirthdayWidget();
    }
  }

  if (pageName === 'guru' && typeof renderGuruListUI === 'function') {
    renderGuruListUI();
  }

  if (pageName === 'siswa' && typeof renderClassCardsUI === 'function') {
    renderClassCardsUI();
  }

  if (pageName === 'kartusiswa' && typeof renderStudentCardsUI === 'function') {
    renderStudentCardsUI();
  }

  if (pageName === 'jadwal' && typeof renderJadwalTableUI === 'function') {
    renderJadwalTableUI();
  }

  if (pageName === 'absensi' && typeof renderAbsensiTableUI === 'function') {
    renderAbsensiTableUI();
  }

  if (pageName === 'nilai' && typeof renderNilaiTableUI === 'function') {
    renderNilaiTableUI();
  }

  if (pageName === 'jurnal' && typeof renderJurnalTableUI === 'function') {
    renderJurnalTableUI();
  }

  if (pageName === 'demografi' && typeof renderDemografiUI === 'function') {
    renderDemografiUI();
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