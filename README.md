# SIAKAD SAGE

Sistem Informasi Akademik Sekolah berbasis web, **open source**, dirancang untuk memudahkan pendidik dan tenaga administrasi. Seluruh data disimpan di komputer pengguna (lokal), dengan backup JSON otomatis ke folder yang dipilih sendiri.

## ✨ Fitur Utama

- **Buku Induk Siswa** (form 8355), kartu siswa, master guru, jadwal, presensi, nilai/rapor, jurnal mengajar, dan demografi akreditasi.
- **Penyimpanan lokal 100%** — data utama ada di browser, bukan server pihak ketiga.
- **Folder penyimpanan pilihan user** — hubungkan folder komputer (mis. `D:/Data Sekolah`) melalui File System Access API.
- **Auto backup setiap perubahan** — setiap perubahan data memicu penulisan `DATABASE_SIAKAD_AUTOSAVE.json` secara otomatis (debounce 900 ms).
- **Riwayat backup berotasi** — file cadangan disimpan di folder `RIWAYAT_BACKUP`, jumlahnya bisa diatur (3–20 file).
- **Auto restore saat dibuka** — jika file backup lebih baru dari data lokal, aplikasi memulihkannya otomatis. Data lokal yang lebih baru tetap menang.
- **Export / Import JSON** — mode *timpa* (pindah unit) atau *gabung* (merge by ID).
- **Proteksi tambahan** — opsi `navigator.storage.persist()` agar data kebal dari pembersihan cache browser.
- **Tema warna** — Sage, Navy, Emerald, Monochrome, Amber, Dark Slate, Blue, Teal.
- **UI responsif** — sidebar bisa diciutkan (Ctrl+B), drawer untuk layar kecil, header dengan status backup.

## 📁 Struktur Folder

```
aplikasi-sekolah-sage/
├── index.html                  # Entry point
├── package.json
├── css/
│   ├── themes.css              # 8 palet tema + alias variabel
│   ├── style.css               # Gaya dasar komponen
│   └── modern.css              # Polishing UI, layout responsif
├── js/
│   ├── core/
│   │   ├── storage-manager.js  # Folder lokal, auto backup, restore, export/import
│   │   ├── data-manager.js     # Semua operasi data (guru, siswa, nilai, dll.)
│   │   └── app.js              # Autentikasi & router halaman
│   └── ui/
│       └── shell.js            # Sidebar, header, panel pengaturan, theme
└── pages/
    ├── dashboard.html
    ├── siswa.html
    ├── guru.html
    ├── jadwal.html
    ├── absensi.html
    ├── nilai.html
    ├── jurnal.html
    ├── demografi.html
    ├── kartusiswa.html
    ├── masterdata.html
    └── pengaturan.html
```

## 🚀 Menjalankan

```bash
npm install
npm run dev
```

Buka alamat `http://localhost:5173` menggunakan **Chrome, Edge, atau Brave** terbaru.
Fitur pemilihan folder (`showDirectoryPicker`) memerlukan koneksi `localhost` atau HTTPS dan browser berbasis Chromium.

Untuk build produksi:

```bash
npm run build
npm run preview
```

## 🌐 Deploy ke Vercel

Repo ini sudah memiliki `vercel.json`, jadi cukup:

1. Push repo ke GitHub/GitLab/Bitbucket.
2. Di Vercel: **Add New → Project → Import repository**.
3. Biarkan konfigurasi bawaan (Framework: Vite, Build: `npm run build`, Output: `dist`).
4. Klik **Deploy**.

Yang perlu diketahui setelah di-deploy:

- **Data tetap lokal.** Vercel hanya menyajikan aplikasi (HTML/JS/CSS). Data guru, siswa, nilai, dan pengaturan tetap berada di `localStorage` browser serta folder komputer yang dipilih user. Tidak ada database di server Vercel.
- **Folder lokal tetap bisa dipilih.** Karena Vercel memakai HTTPS, API `showDirectoryPicker()` berjalan di browser Chromium (Chrome/Edge/Brave).
- **Browser non-Chromium** (Firefox/Safari) belum mendukung pemilihan folder. Pengguna tersebut tetap bisa memakai aplikasi dengan **Download Backup (.json)** dan **Import File JSON** secara manual.
- **Izin folder mungkin perlu diklik ulang** setelah komputer direstart atau browser ditutup. Klik tombol **Pulihkan Izin Folder** di Pengaturan bila status menunjukkan demikian.
- **Domain menentukan data.** Data di `https://project.vercel.app` terpisah dari data di custom domain. Gunakan export/import JSON untuk memindahkannya.

## 💾 Cara Kerja Backup

1. Buka **Pengaturan Sistem → Penyimpanan Komputer Lokal**.
2. Klik **Pilih Folder di Komputer**, lalu pilih folder, misalnya `D:/Data Sekolah`.
3. Setiap ada perubahan data, sistem otomatis menulis:
   - `DATABASE_SIAKAD_AUTOSAVE.json` — backup terbaru.
   - `RIWAYAT_BACKUP/backup_YYYYMMDD_HHMMSS.json` — riwayat versi sebelumnya.
4. Saat aplikasi dibuka lagi, izin folder diminta kembali bila diperlukan, lalu backup terbaru dipulihkan otomatis jika lebih baru dari data lokal.
5. Untuk pindah komputer/unit: **Download Backup (.json)** di komputer lama, lalu **Import File JSON** di komputer baru.

>_catatan:_ File backup berisi seluruh data sekolah dalam format JSON plain-text. Simpan folder tersebut di lokasi yang aman dan lakukan salinan ekstra secara berkala.

## 🔐 Akun Demo

| Username | Password |
|----------|----------|
| `admin`  | `admin`  |

## 📄 Lisensi

Open source. Silakan digunakan dan dikembangkan untuk keperluan pendidikan.

Dikembangkan oleh **Urai Ikhsan Fadhilah**.
