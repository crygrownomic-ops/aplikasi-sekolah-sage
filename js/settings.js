// MEMATIKAN ATAU MEMUAT SETTINGAN TEMA DAN PROFIL SEKOLAH

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

// Eksekusi Langsung Begitu Script Dimuat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSchoolSettings);
} else {
  loadSchoolSettings();
}