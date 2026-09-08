// SIMPAN & MUAT REGISTRASI PROFIL SEKOLAH DENGAN LOCALSTORAGE

document.addEventListener('DOMContentLoaded', () => {
  loadSchoolSettings();
});

// 1. Fungsi Ganti Tema
function setTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('app_theme', themeName);

  // Update status visual card pilihan tema
  document.querySelectorAll('.theme-card').forEach(card => {
    card.classList.remove('active');
  });
  const activeCard = document.querySelector(`.theme-card[data-theme-name="${themeName}"]`);
  if (activeCard) activeCard.classList.add('active');
}

// 2. Fungsi Simpan Profil & Kontak Sekolah
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

// 3. Fungsi Upload Logo Sekolah
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

// 4. Update Tampilan UI Header secara Dinamis
function updateHeaderUI() {
  const name = localStorage.getItem('school_name') || 'SMA Negeri 1 Digital';
  const email = localStorage.getItem('school_email') || 'info@sekolah.sch.id';
  const phone = localStorage.getItem('school_phone') || '(021) 555-0192';
  const logo = localStorage.getItem('school_logo');

  document.getElementById('displayNamaSekolah').innerText = name;
  document.getElementById('displayEmailSekolah').innerText = email;
  document.getElementById('displayTelpSekolah').innerText = phone;

  // Render Logo jika ada, jika tidak tampilkan ikon default
  const logoContainer = document.getElementById('displayLogoSekolah');
  if (logo) {
    logoContainer.innerHTML = `<img src="${logo}" alt="Logo Sekolah">`;
  } else {
    logoContainer.innerHTML = `<svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
  }
}

// 5. Muat Pengaturan Awal saat Aplikasi Dibuka
function loadSchoolSettings() {
  // Restore Tema
  const savedTheme = localStorage.getItem('app_theme') || 'sage';
  setTheme(savedTheme);

  // Restore Input Form
  if (localStorage.getItem('school_name')) {
    document.getElementById('inputNamaSekolah').value = localStorage.getItem('school_name');
  }
  if (localStorage.getItem('school_email')) {
    document.getElementById('inputEmailSekolah').value = localStorage.getItem('school_email');
  }
  if (localStorage.getItem('school_phone')) {
    document.getElementById('inputTelpSekolah').value = localStorage.getItem('school_phone');
  }

  updateHeaderUI();
}