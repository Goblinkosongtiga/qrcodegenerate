# 🔗 QR Code Generator

Generator QR Code gratis berbasis browser — **tanpa database**, **tanpa backend**, siap deploy di **Vercel**.

![QR Code Generator](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Vercel](https://img.shields.io/badge/deploy-vercel-black)

## ✨ Fitur

- ✅ Generate QR Code dari link/URL
- ✅ Download sebagai PNG
- ✅ Kustomisasi warna QR & latar
- ✅ Pilih ukuran (200–512 px)
- ✅ Pilih level error correction (L/M/Q/H)
- ✅ Riwayat generate (disimpan di `localStorage`)
- ✅ Copy URL ke clipboard
- ✅ Responsif (mobile-friendly)
- ✅ **100% client-side** — data tidak dikirim ke server
- ✅ Tanpa database, tanpa backend

## 🚀 Demo

Setelah deploy: `https://<nama-proyek>.vercel.app`

## 🛠️ Tech Stack

- HTML5
- CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (ES6+)
- [qrcodejs](https://github.com/davidshimjs/qrcodejs) via CDN

## 📦 Menjalankan Lokal

```bash
# Clone repo
git clone https://github.com/<username>/qr-generator.git
cd qr-generator

# Opsi 1: pakai npx serve
npm run dev
# buka http://localhost:3000

# Opsi 2: buka langsung
# buka public/index.html di browser
```

## ☁️ Deploy ke Vercel

### Cara 1 — Via Dashboard (termudah)

1. Push repo ke GitHub.
2. Buka [vercel.com/new](https://vercel.com/new).
3. Import repo GitHub Anda.
4. **Framework Preset**: `Other`
5. **Root Directory**: `public` (biarkan default jika Vercel mendeteksi)
   - Jika Vercel tidak mendeteksi, set **Output Directory** ke `public`.
6. Klik **Deploy**.

### Cara 2 — Via CLI

```bash
npm i -g vercel
vercel
# ikuti instruksi
```

### Cara 3 — Via Git (auto-deploy)

Setelah project terhubung ke Vercel, setiap `git push` ke `main` akan otomatis deploy.

## 📁 Struktur

```
qr-generator/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── vercel.json
├── package.json
├── .gitignore
├── LICENSE
└── README.md
```

## 🤝 Kolaborasi

1. Fork repo ini.
2. Buat branch fitur: `git checkout -b fitur-baru`.
3. Commit perubahan: `git commit -m "Tambah fitur X"`.
4. Push: `git push origin fitur-baru`.
5. Buka Pull Request.

## 📝 Lisensi

MIT — lihat [LICENSE](LICENSE).

## 🙏 Kredit

- [qrcodejs](https://github.com/davidshimjs/qrcodejs) oleh davidshimjs
- Terinspirasi dari berbagai QR generator open-source
