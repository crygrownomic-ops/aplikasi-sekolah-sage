// LOGIKA NAVIGASI DENGAN KLIK TOMBOL SIDEBAR
function navigatePage(pageId) {
  // 1. Sembunyikan semua tampilan halaman
  document.querySelectorAll('.page-view').forEach(page => {
    page.classList.remove('active');
  });

  // 2. Nonaktifkan semua status aktif tombol sidebar
  document.querySelectorAll('.sidebar .nav-item').forEach(btn => {
    btn.classList.remove('active');
  });

  // 3. Tampilkan halaman target
  const targetPage = document.getElementById('page-' + pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // 4. Aktifkan status visual tombol yang diklik
  if (window.event && window.event.currentTarget) {
    window.event.currentTarget.classList.add('active');
  }
}