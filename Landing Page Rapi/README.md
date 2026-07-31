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

## Keputusan desain

- **Nggak pakai emoji sebagai ikon.** Emoji beda rupa di tiap sistem operasi dan
  ukurannya nggak bisa dikontrol. Semua ikon digambar di `components/Icon.astro`
  dengan ketebalan garis seragam.
- **Grid sengaja nggak simetris** (bento). Kalau semua kartu seukuran, semua
  fitur terasa sama penting — padahal "ketik" itu jalan utamanya.
- **Satu kartu kuning saja** di seluruh halaman, supaya mata punya tujuan.
- **Hero memperagakan, bukan menceritakan.** Demo ketik di hero menjalankan
  contoh sungguhan → hasil baca → tersimpan. Menjelaskan itu butuh satu
  paragraf; memperagakan butuh lima detik.

## Yang masih perlu diganti

| Bagian | Status |
|---|---|
| Bukti sosial | **Sengaja tanpa angka & testimoni.** Rapi belum punya pengguna sebanyak itu, dan mengarang angka di app keuangan itu bunuh diri. Diganti section "Kenapa bisa dipercaya" yang semua klaimnya bisa dicek di kode. Ganti dengan testimoni asli begitu ada. |
| Gambar Open Graph | ✅ Sudah 1200×630 (`public/og-image.png`). |
| Pratinjau app | Hero sekarang pakai **demo ketik interaktif**, bukan screenshot. Kalau nanti mau menambah tangkapan layar Dashboard asli, taruh di `public/` lalu sisipkan di section Fitur. |
| `site` di `astro.config.mjs` | Masih `rapi-landing.vercel.app`. Ganti kalau sudah punya domain. |

## Deploy

Situs statis murni — hasil `dist/` bisa ditaruh di mana saja. Kalau lewat Vercel:
buat project baru, set **Root Directory** ke folder ini, build `npm run build`,
output `dist`.
