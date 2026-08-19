# JaneMarket - Modern Digital Storefront

Website e-commerce digital store modern, responsif, dan lengkap dengan sistem checkout WhatsApp otomatis, katalog produk dinamis, asisten AI, dan portal admin.

---

## 🚀 Panduan Deploy ke Vercel (100% Fixed & Bebas 404)

Penyebab 404 sebelumnya adalah konfigurasi routing lambda legacy. Struktur sekarang telah disesuaikan dengan arsitektur modern Vercel:
- File frontend statis (`index.html`, gambar, css, font) dilayani langsung secara instan oleh **Vercel Global CDN**.
- Backend API (`/api/*`) diproses secara otomatis oleh serverless function **`api/index.js`**.

### Langkah Deploy:
1. **Download / Export Kode**:
   - Di AI Studio, klik menu **Settings (Titik Tiga)** di pojok kanan atas, lalu pilih **Export to GitHub** atau **Download ZIP**.
2. **Push ke GitHub**:
   - Upload file proyek ke repository GitHub Anda (misalnya `janemarket`).
3. **Import di Vercel**:
   - Buka [vercel.com/new](https://vercel.com/new).
   - Hubungkan akun GitHub Anda dan pilih repository `janemarket`.
4. **Deploy**:
   - Di halaman konfigurasi Vercel:
     - **Framework Preset**: Pilih **Other** (atau biarkan default).
     - **Root Directory**: `./` (default).
     - **Build Command**: `node build.js` (atau kosongkan).
     - **Output Directory**: biarkan default.
   - (Opsional) Tambahkan Environment Variable `GEMINI_API_KEY` jika ingin fitur AI Chatbot aktif.
   - Klik tombol **"Deploy"**.

Website akan langsung online tanpa error 404!

---

## 🔑 Login Portal Admin
- **PIN Default**: `123456`
- **Fitur Admin**: Tambah produk, edit harga/stok/deskripsi, ganti nomor WhatsApp & QRIS, ubah banner promo.
