// MANAJEMEN MASTER DATA, GURU, SISWA, DROPDOWN & ULANG TAHUN

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

// ===================================================
// GURU MANAGEMENT
// ===================================================
function getGuruData() {
  const data = localStorage.getItem('siakad_guru_list');
  if (data) {
    return JSON.parse(data);
  } else {
    const defaultGuru = [
      { id: 1, nip: '198203152010011002', nama: 'Dr. Ahmad Fauzi, M.Pd.', mapel: 'Matematika Wajib', kepegawaian: 'PNS / ASN', tglLahir: '1982-09-15', hp: '081234567890', email: 'ahmad.fauzi@sekolah.sch.id' },
      { id: 2, nip: '199005202018022001', nama: 'Siti Nurhaliza, S.Pd.', mapel: 'Fisika', kepegawaian: 'PPPK', tglLahir: '1990-09-20', hp: '085678901234', email: 'siti.nurhaliza@sekolah.sch.id' }
    ];
    localStorage.setItem('siakad_guru_list', JSON.stringify(defaultGuru));
    return defaultGuru;
  }
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
      document.getElementById('inputNipGuru').value = guru.nip;
      document.getElementById('inputNamaGuru').value = guru.nama;
      document.getElementById('inputTglLahirGuru').value = guru.tglLahir || '';
      document.getElementById('inputMapelGuru').value = guru.mapel || '';
      document.getElementById('inputKepegawaianGuru').value = guru.kepegawaian || '';
      document.getElementById('inputHpGuru').value = guru.hp || '';
      document.getElementById('inputEmailGuru').value = guru.email || '';
    }
  } else {
    title.innerText = 'Tambah Data Guru Baru';
    editIdInput.value = '';
    document.getElementById('inputNipGuru').value = '';
    document.getElementById('inputNamaGuru').value = '';
    document.getElementById('inputTglLahirGuru').value = '';
    document.getElementById('inputMapelGuru').value = '';
    document.getElementById('inputKepegawaianGuru').value = '';
    document.getElementById('inputHpGuru').value = '';
    document.getElementById('inputEmailGuru').value = '';
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
  const nip = document.getElementById('inputNipGuru').value.trim();
  const nama = document.getElementById('inputNamaGuru').value.trim();
  const tglLahir = document.getElementById('inputTglLahirGuru').value;
  const mapel = document.getElementById('inputMapelGuru').value;
  const kepegawaian = document.getElementById('inputKepegawaianGuru').value;
  const hp = document.getElementById('inputHpGuru').value.trim();
  const email = document.getElementById('inputEmailGuru').value.trim();

  let list = getGuruData();

  if (editId) {
    list = list.map(g => {
      if (g.id === Number(editId)) {
        return { ...g, nip, nama, tglLahir, mapel, kepegawaian, hp, email };
      }
      return g;
    });
  } else {
    list.push({ id: Date.now(), nip, nama, tglLahir, mapel, kepegawaian, hp, email });
  }

  localStorage.setItem('siakad_guru_list', JSON.stringify(list));
  closeGuruModal();
  renderGuruListUI();
  populateDynamicSelects();
  renderBirthdayWidget();
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
          Belum ada data guru terdaftar. Klik "+ Tambah Guru Baru" di atas.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  list.forEach((guru, idx) => {
    const formattedTgl = guru.tglLahir ? new Date(guru.tglLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
    
    html += `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-weight: 600;">${guru.nip}</td>
        <td style="font-weight: 600;">${guru.nama}</td>
        <td>${guru.mapel || '-'}</td>
        <td><span style="background: var(--accent-soft); padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${guru.kepegawaian || '-'}</span></td>
        <td>${formattedTgl}</td>
        <td style="font-size: 13px;">${guru.hp || ''}<br><span style="color: var(--text-muted); font-size: 11px;">${guru.email || ''}</span></td>
        <td style="text-align: center;">
          <div class="action-btn-group">
            <button type="button" class="btn-icon-action" onclick="openGuruModal(${guru.id})" title="Edit Guru">
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button type="button" class="btn-icon-action del" onclick="deleteGuruItem(${guru.id})" title="Hapus Guru">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ===================================================
// SISWA MANAGEMENT
// ===================================================
function getSiswaData() {
  const data = localStorage.getItem('siakad_siswa_list');
  if (data) {
    return JSON.parse(data);
  } else {
    const defaultSiswa = [
      { id: 101, nisn: '0051234561', nis: '23241001', nama: 'Aditya Pratama', kelas: 'X - A', jurusan: 'IPA (Ilmu Pengetahuan Alam)', jk: 'L', tempatLahir: 'Jakarta', tglLahir: '2008-04-12' },
      { id: 102, nisn: '0051234562', nis: '23241002', nama: 'Anisa Rahmawati', kelas: 'X - A', jurusan: 'IPA (Ilmu Pengetahuan Alam)', jk: 'P', tempatLahir: 'Bandung', tglLahir: '2008-08-25' },
      { id: 103, nisn: '0051234563', nis: '23241003', nama: 'Budi Santoso', kelas: 'XI - IPA 1', jurusan: 'IPA (Ilmu Pengetahuan Alam)', jk: 'L', tempatLahir: 'Bogor', tglLahir: '2007-02-10' }
    ];
    localStorage.setItem('siakad_siswa_list', JSON.stringify(defaultSiswa));
    return defaultSiswa;
  }
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

// 1. OPEN MODAL DETAIL SISWA PER KELAS
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
    const formattedTgl = siswa.tglLahir ? `${siswa.tempatLahir || ''}, ${new Date(siswa.tglLahir).toLocaleDateString('id-ID')}` : '-';

    html += `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-weight: 600;">${siswa.nisn}</td>
        <td>${siswa.nis}</td>
        <td style="font-weight: 600;">${siswa.nama}</td>
        <td>${siswa.jurusan || '-'}</td>
        <td style="text-align: center;">${siswa.jk}</td>
        <td>${formattedTgl}</td>
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

// 2. OPEN & HANDLE MODAL FORM INPUT SISWA BARU GLOBAL (TOMBOL LUAR)
function openAddSiswaModalGlobal() {
  const modal = document.getElementById('modalAddSiswaGlobal');
  if (!modal) return;

  populateDynamicSelects();

  document.getElementById('inputSiswaKelasGlobal').value = '';
  document.getElementById('inputSiswaJurusanGlobal').value = '';
  document.getElementById('inputSiswaNisnGlobal').value = '';
  document.getElementById('inputSiswaNisGlobal').value = '';
  document.getElementById('inputSiswaNamaGlobal').value = '';
  document.getElementById('inputSiswaJkGlobal').value = 'L';
  document.getElementById('inputSiswaTempatLahirGlobal').value = '';
  document.getElementById('inputSiswaTglLahirGlobal').value = '';
  document.getElementById('inputSiswaNikGlobal').value = '';
  document.getElementById('inputSiswaAlamatGlobal').value = '';

  modal.classList.remove('hidden');
}

function closeAddSiswaModalGlobal() {
  const modal = document.getElementById('modalAddSiswaGlobal');
  if (modal) modal.classList.add('hidden');
}

function handleSaveSiswaGlobal(e) {
  e.preventDefault();

  const kelas = document.getElementById('inputSiswaKelasGlobal').value;
  const jurusan = document.getElementById('inputSiswaJurusanGlobal').value;
  const nisn = document.getElementById('inputSiswaNisnGlobal').value.trim();
  const nis = document.getElementById('inputSiswaNisGlobal').value.trim();
  const nama = document.getElementById('inputSiswaNamaGlobal').value.trim();
  const jk = document.getElementById('inputSiswaJkGlobal').value;
  const tempatLahir = document.getElementById('inputSiswaTempatLahirGlobal').value.trim();
  const tglLahir = document.getElementById('inputSiswaTglLahirGlobal').value;
  const nik = document.getElementById('inputSiswaNikGlobal').value.trim();
  const alamat = document.getElementById('inputSiswaAlamatGlobal').value.trim();

  let list = getSiswaData();
  list.push({ id: Date.now(), nisn, nis, nama, kelas, jurusan, tempatLahir, tglLahir, jk, nik, alamat });

  localStorage.setItem('siakad_siswa_list', JSON.stringify(list));

  closeAddSiswaModalGlobal();
  renderClassCardsUI();
  alert(`Siswa ${nama} berhasil didaftarkan ke kelas ${kelas}!`);
}

function deleteSiswaItem(id, kelas) {
  let list = getSiswaData();
  const item = list.find(s => s.id === id);
  if (item && confirm(`Hapus siswa "${item.nama}"?`)) {
    list = list.filter(s => s.id !== id);
    localStorage.setItem('siakad_siswa_list', JSON.stringify(list));
    renderSiswaTableUI(kelas);
    renderClassCardsUI();
  }
}

// ===================================================
// POPULATE DROPDOWNS & NOTIFIKASI
// ===================================================
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
  const currentMonth = new Date().getMonth() + 1;
  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const birthdayGurus = gurus.filter(g => {
    if (!g.tglLahir) return false;
    const m = parseInt(g.tglLahir.split('-')[1], 10);
    return m === currentMonth;
  });

  if (birthdayGurus.length === 0) {
    container.innerHTML = `
      <div class="birthday-banner">
        <div class="birthday-badge-icon">🎂</div>
        <div class="birthday-info">
          <h4>Ulang Tahun Guru Bulan Ini (${monthNames[currentMonth]})</h4>
          <p>Tidak ada guru yang berulang tahun pada bulan ini.</p>
        </div>
      </div>
    `;
    return;
  }

  let guruNames = birthdayGurus.map(g => {
    const day = parseInt(g.tglLahir.split('-')[2], 10);
    return `<b>${g.nama}</b> (${day} ${monthNames[currentMonth]})`;
  }).join(', ');

  container.innerHTML = `
    <div class="birthday-banner">
      <div class="birthday-badge-icon">🎂</div>
      <div class="birthday-info">
        <h4>Selamat Ulang Tahun Bulan ${monthNames[currentMonth]}! 🎉</h4>
        <p>Mari ucapkan selamat kepada: ${guruNames}</p>
      </div>
    </div>
  `;
}

function setTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('app_theme', themeName);

  document.querySelectorAll('.theme-card').forEach(card => card.classList.remove('active'));
  const activeCard = document.querySelector(`.theme-card[data-theme-name="${themeName}"]`);
  if (activeCard) activeCard.classList.add('active');
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
  alert('Profil Sekolah Berhasil Disimpan!');
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      localStorage.setItem('school_logo', e.target.result);
      updateHeaderUI();
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

  if (nameInput && localStorage.getItem('school_name')) nameInput.value = localStorage.getItem('school_name');
  if (emailInput && localStorage.getItem('school_email')) emailInput.value = localStorage.getItem('school_email');
  if (phoneInput && localStorage.getItem('school_phone')) phoneInput.value = localStorage.getItem('school_phone');

  updateHeaderUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSchoolSettings);
} else {
  loadSchoolSettings();
}