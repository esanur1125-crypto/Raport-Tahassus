# Raport & Mutaba'ah Tahassus - MI Syuriyah

Aplikasi Penilaian, Jurnal Hafalan (Mutaba'ah), Presensi, dan Cetak Raport Tahassus Al-Qur'an & Fashohati/Qiroati Kelas 1 s.d. 6 MI Syuriyah.

---

## 🚀 Panduan Deploy ke Vercel

Aplikasi ini dibangun menggunakan **React 19 + TypeScript + Vite + Tailwind CSS**, siap langsung di-deploy ke Vercel tanpa perlu konfigurasi rumit.

### Metode 1: Deploy Melalui Vercel Dashboard (Rekomendasi)

1. **Unggah Kode ke GitHub**:
   - Buat repositori baru di akun GitHub Anda (misal: `raport-tahassus-mi-syuriyah`).
   - Push seluruh kode proyek ini ke repositori tersebut:
     ```bash
     git init
     git add .
     git commit -m "Inisialisasi aplikasi Raport Tahassus"
     git branch -M main
     git remote add origin https://github.com/USERNAME/REPO_NAME.git
     git push -u origin main
     ```

2. **Impor Proyek di Vercel**:
   - Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
   - Klik tombol **"Add New..."** > **"Project"**.
   - Pilih repositori GitHub Anda dan klik **"Import"**.

3. **Konfigurasi Project**:
   - **Framework Preset**: `Vite` (terdeteksi otomatis).
   - **Root Directory**: `./` (default).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Deploy**:
   - Klik tombol **"Deploy"**.
   - Vercel akan otomatis meng-compile aplikasi dan memberikan URL produksi (contoh: `https://raport-tahassus-mi-syuriyah.vercel.app`).

---

### Metode 2: Deploy Menggunakan Vercel CLI

Jika Anda memiliki Vercel CLI terpasang di komputer:

1. Buka terminal di folder proyek ini.
2. Login ke Vercel:
   ```bash
   npx vercel login
   ```
3. Deploy proyek:
   ```bash
   npx vercel
   ```
4. Untuk deploy ke domain production langsung:
   ```bash
   npx vercel --prod
   ```

---

## ⚙️ Konfigurasi Vercel (`vercel.json`)

Berkas `vercel.json` telah disediakan dengan konfigurasi:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Aturan `rewrites` di atas memastikan semua rute SPA (*Single Page Application*) diarahkan ke `index.html` dengan benar sehingga tidak menghasilkan halaman error 404 saat direfresh.

---

## 💾 Penyimpanan & Cadangan Data

- **Penyimpanan Lokal (Offline First)**: Data siswa, penilaian, jurnal, dan presensi tersimpan aman di browser (*LocalStorage*).
- **Cadangan Data (Backup & Restore)**:
  - Masuk ke menu **Setelan**.
  - Klik **Unduh Berkas JSON (.json)** untuk menyimpan cadangan ke komputer atau flashdisk.
  - Untuk memindahkan data ke komputer atau peramban lain, tempel teks JSON pada kolom **Pulihkan Data dari Teks Cadangan** dan klik **Terapkan Pemulihan**.
- **Ekspor Excel / CSV**:
  - Data siswa, nilai kelas, jurnal mutaba'ah, dan presensi harian dapat diekspor ke format `.csv` yang dapat langsung dibuka di Microsoft Excel.
