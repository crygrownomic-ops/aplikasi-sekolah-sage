// MANAJEMEN TEMA, PROFIL SEKOLAH & KELOLA MASTER DATA DINAMIS

// Default Data Master Jika Belum Pernah Disimpan
const defaultMasterData = {
  kelas: ['X - A', 'X - B', 'XI - IPA 1', 'XI - IPS 1', 'XII - IPA 1'],
  mapel: ['Matematika Wajib', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika', 'Pendidikan Agama', 'Biologi', 'Kimia', 'Sejarah'],
  kepegawaian: ['PNS / ASN', 'PPPK', 'Guru Tetap Yayasan (GTY)', 'Guru Tidak Tetap (GTT)'],
  jurusan: ['IPA (Ilmu Pengetahuan Alam)', 'IPS (Ilmu Pengetahuan Sosial)', 'Bahasa & Budaya', 'Teknik Komputer & Jaringan']
};

// 1. Ambil Data Master dari LocalStorage
function getMasterData(type) {
  const data = localStorage.getItem(`master_${type}`);
  if (data) {
    return JSON.parse(data);
  } else {
    localStorage.setItem(`master_${type}`, JSON.stringify(defaultMasterData[type] || []));
    return defaultMasterData[type] || [];
  }
}

// 2. Tambah Item Master Data Baru
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
      alert('Data ini sudah ada di dalam list master!');
    }
  }
}

// 3. Hapus Item Master Data
function deleteMasterItem(type, index) {
  const list = getMasterData(type);
  if (confirm(`Hapus "${list[index]}" dari master data?`)) {
    list.splice(index, 1);
    localStorage.setItem(`master_${type}`, JSON.stringify(list));
    renderMasterDataUI();
    populateDynamicSelects();
  }
}

// 4. Render Tampilan List di Modul Master Data
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

// 5. Populate Otomatis Dropdown Select di Seluruh Form Aplikasi
function populateDynamicSelects() {
  // Populate Kelas Selects
  const kelasSelects = document.querySelectorAll('select[data-master="kelas"]');
  const kelass = getMasterData('kelas');
  kelasSelects.forEach(select => {
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Pilih Kelas --</option>' +
      kelass.map(k => `<option value="${k}">${k}</option>`).join('');
    if (currentVal && kelass.includes(currentVal)) select.value = currentVal;
  });

  // Populate Mapel Selects
  const mapelSelects = document.querySelectorAll('select[data-master="mapel"]');
  const mapels = getMasterData('mapel');
  mapelSelects.forEach(select => {
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Pilih Mapel --</option>' +
      mapels.map(m => `<option value="${m}">${m}</option>`).join('');
    if (currentVal && mapels.includes(currentVal)) select.value = currentVal;
  });

  // Populate Kepegawaian Selects
  const kepSelects = document.querySelectorAll('select[data-master="kepegawaian"]');
  const keps = getMasterData('kepegawaian');
  kepSelects.forEach(select => {
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Pilih Status --</option>' +
      keps.map(k => `<option value="${k}">${k}</option>`).join('');
    if (currentVal && keps.includes(currentVal)) select.value = currentVal;
  });

  // Populate Jurusan Selects
  const jurusanSelects = document.querySelectorAll('select[data-master="jurusan"]');
  const jurusans = getMasterData('jurusan');
  jurusanSelects.forEach(select => {
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Pilih Jurusan --</option>' +
      jurusans.map(j => `<option value="${j}">${j}</option>`).join('');
    if (currentVal && jurusans.includes(currentVal)) select.value = currentVal;
  });
}

// 6. Fungsi Setting Tema & Identitas
function setTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('app_theme', themeName);

  document.querySelectorAll('.theme-card').forEach(card => {
    card.classList.remove('active');
  });
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
  alert('Profil dan Identitas Sekolah Berhasil Disimpan!');
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const logoBase64 = e.target.result;
      localStorage.setItem('school_logo', logoBase64);
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
    if (logo) {
      elLogo.innerHTML = `<img src="${logo}" alt="Logo Sekolah">`;
    } else {
      elLogo.innerHTML = `<svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
    }
  }

  if (elLoginLogo && logo) {
    elLoginLogo.innerHTML = `<img src="${logo}" alt="Logo Sekolah">`;
  }
}

function loadSchoolSettings() {
  const savedTheme = localStorage.getItem('app_theme') || 'sage';
  setTheme(savedTheme);

  const nameInput = document.getElementById('inputNamaSekolah');
  const emailInput = document.getElementById('inputEmailSekolah');
  const phoneInput = document.getElementById('inputTelpSekolah');

  if (nameInput && localStorage.getItem('school_name')) {
    nameInput.value = localStorage.getItem('school_name');
  }
  if (emailInput && localStorage.getItem('school_email')) {
    emailInput.value = localStorage.getItem('school_email');
  }
  if (phoneInput && localStorage.getItem('school_phone')) {
    phoneInput.value = localStorage.getItem('school_phone');
  }

  updateHeaderUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSchoolSettings);
} else {
  loadSchoolSettings();
}