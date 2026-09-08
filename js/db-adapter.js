// MODUL ADAPTOR PENYIMPANAN HYBRID (LOCAL / SUPABASE)

const DB = {
  // Cek apakah user menggunakan Supabase atau Local
  isSupabaseActive() {
    const url = localStorage.getItem('supabase_url');
    const key = localStorage.getItem('supabase_key');
    return Boolean(url && key && window.supabase);
  },

  // Mendapatkan Instance Supabase Client
  getClient() {
    if (this.isSupabaseActive()) {
      const url = localStorage.getItem('supabase_url');
      const key = localStorage.getItem('supabase_key');
      return window.supabase.createClient(url, key);
    }
    return null;
  },

  // FUNGSI BACA DATA (GET)
  async get(key) {
    if (this.isSupabaseActive()) {
      try {
        const client = this.getClient();
        const { data, error } = await client.from(key).select('*');
        if (!error && data) return data;
      } catch (err) {
        console.warn('Gagal konek Supabase, fallback ke Local Storage:', err);
      }
    }
    // Default / Fallback Lokal
    const localData = localStorage.getItem(key);
    return localData ? JSON.parse(localData) : [];
  },

  // FUNGSI SIMPAN DATA (SAVE)
  async save(key, dataArray) {
    // Selalu simpan ke Lokal untuk backup offline
    localStorage.setItem(key, JSON.stringify(dataArray));

    if (this.isSupabaseActive()) {
      try {
        const client = this.getClient();
        // Upsert data ke tabel Supabase
        await client.from(key).upsert(dataArray);
      } catch (err) {
        console.error('Gagal sinkron ke Supabase:', err);
      }
    }
  },

  // MIKRASI / MENGUNGGAH DATA LOKAL KE SUPABASE (1-CLICK SYNC)
  async migrateLocalToSupabase() {
    if (!this.isSupabaseActive()) {
      alert('Isi URL & API Key Supabase terlebih dahulu di Pengaturan!');
      return;
    }

    try {
      const client = this.getClient();
      const keys = ['siakad_guru_list', 'siakad_siswa_list', 'master_kelas', 'master_mapel'];

      for (const key of keys) {
        const localData = localStorage.getItem(key);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            await client.from(key).upsert(parsed);
          }
        }
      }
      alert('Selesai! Semua data lokal berhasil diunggah ke Supabase Cloud 🎉');
    } catch (err) {
      alert('Gagal migrasi data: ' + err.message);
    }
  }
};