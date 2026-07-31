# Landing Page Rapi

Situs statis buat mengenalkan **rapi.app** ke orang yang belum pernah pakai, lalu
mengarahkan mereka memasangnya. Ini **terpisah** dari app-nya — app tetap hidup
sendiri di `../src`, landing page nggak menyentuhnya sama sekali.

## Jalankan

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # hasilnya ke dist/
npm run preview  # cek hasil build
```

## Struktur

```
src/
├── consts.ts              # Alamat app, tagline, menu navigasi — ubah di sini, bukan di komponen
├── layouts/Base.astro     # Kerangka HTML: SEO, Open Graph, favicon, font
├── components/
│   ├── Header.astro       # Logo + navigasi + tombol "Buka Rapi"
│   ├── Hero.astro         # Judul utama + pratinjau app dalam bingkai HP
│   ├── Why.astro          # Kenapa Rapi beda — bicara masalahnya dulu
│   ├── Features.astro     # 3 cara nyatat + fitur pendukung
│   ├── HowTo.astro        # 3 langkah mulai pakai
│   ├── Faq.astro          # Tanya jawab
│   └── CtaFooter.astro    # Ajakan penutup + footer
├── pages/index.astro      # Menyusun semua section
└── styles/global.css      # Token Rapi + kelas tombol/kartu
```

## Aturan yang dipakai

- **Token desain disalin dari app** (`tailwind.config.mjs`) — warna, radius, dan
  bayangannya identik biar landing page dan produknya terasa satu keluarga.
- **Copy pakai suara Rapi**: panggil "kamu", santai, nggak menghakimi. Lihat
  Bagian 2 di `../CLAUDE.md`.
- **Nominal ditulis penuh** (`Rp 2.865.000`), nggak dibulatkan jadi "Rp 2,9 jt".

## Yang masih perlu diganti

| Bagian | Status |
|---|---|
| Pratinjau app di Hero | Masih **tiruan HTML**, bukan tangkapan layar asli. Ganti dengan screenshot Dashboard beneran. |
| `site` di `astro.config.mjs` | Masih `rapi-landing.vercel.app`. Ganti kalau sudah punya domain. |
| Bukti sosial | Belum ada sama sekali — jumlah pengguna, testimoni, atau ulasan. Tambahkan kalau datanya sudah nyata, jangan dikarang. |
| Gambar Open Graph | Masih memakai ikon app. Idealnya dibuat khusus 1200×630. |

## Deploy

Situs statis murni — hasil `dist/` bisa ditaruh di mana saja. Kalau lewat Vercel:
buat project baru, set **Root Directory** ke folder ini, build `npm run build`,
output `dist`.
