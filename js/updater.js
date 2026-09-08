// FITUR UPDATE FITUR OTOMATIS DARI DEVELOPER
const CURRENT_VERSION = "1.2.0";

async function checkForUpdates() {
  try {
    // Mengambil versi terbaru dari server Abah (misal via GitHub Pages/Vercel)
    const response = await fetch('https://raw.githubusercontent.com/username/siakad-app/main/version.json');
    if (!response.ok) return;

    const remoteData = await response.json();

    if (remoteData.version !== CURRENT_VERSION) {
      if (confirm(`Pembaruan Fitur Tersedia (v${remoteData.version})!\n\nCatatan Rilis:\n${remoteData.changelog}\n\nApakah ingin memuat ulang untuk memperbarui aplikasi?`)) {
        window.location.reload(true); // Memperbarui cache browser
      }
    }
  } catch (e) {
    // Jika tidak ada koneksi internet (offline), aplikasi tetap berjalan lancar tanpa ganguan
    console.log('Modul offline aktif - Melewati pengecekan update.');
  }
}

// Cek update setiap kali aplikasi dibuka
document.addEventListener('DOMContentLoaded', checkForUpdates);