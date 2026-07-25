# Rapi — #RapiinAja 💛

Aplikasi keuangan personal untuk anak muda Indonesia. Catat keuangan tanpa ribet — via teks, suara, atau foto struk, dibantu AI.

## Struktur Folder

```
RAPI.APP/
├── CLAUDE.md                       # Instruksi utama untuk Claude Code (WAJIB dibaca)
├── README.md                       # File ini
├── docs/                           # Dokumen produk
│   ├── Rapi_PRD.docx               # Product Requirements (taruh di sini)
│   └── Rapi_Brand_Guidelines.docx  # Brand guidelines (taruh di sini)
├── design/                         # Referensi desain
│   ├── ui-kit-dashboard.html       # UI kit high-fidelity — buka di browser
│   ├── userflow-wireframe.html     # User flow & wireframe — buka di browser
│   └── marketing/                  # Aset Instagram / social media
└── src/                            # Kode aplikasi (dibuat saat development dimulai)
```

## Mulai Development dengan Claude Code

1. Buka terminal di folder ini: `cd F:\KERJAAN\RAPI.APP`
2. Jalankan `claude`
3. Claude Code otomatis membaca `CLAUDE.md` — semua aturan brand, design system, dan tech stack sudah ada di sana.

## Tech Stack

Vite + React 18 + TypeScript · Tailwind CSS · shadcn/ui · Zustand · Anthropic API

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output ke dist/
npm run preview  # cek hasil build lokal
```

## Deploy (static SPA, tanpa backend)

App ini murni client-side (data di LocalStorage, AI pakai BYOK) — jadi tinggal
build & serve folder `dist/`. Config deploy sudah disiapkan:

- **`public/_redirects`** — SPA fallback (route client-side nggak 404 pas refresh)
- **`public/_headers`** — security headers (CSP, nosniff, frame-ancestors, dll)
- **`netlify.toml`** — build config Netlify
- **`vercel.json`** — rewrite + headers untuk Vercel

**Cara deploy (pilih salah satu, semua gratis):**

| Host | Langkah | Baca `_headers`/`_redirects` |
|------|---------|------------------------------|
| **Netlify** | Connect repo → build `npm run build`, publish `dist` (auto dari `netlify.toml`) | ✅ |
| **Cloudflare Pages** | Connect repo → build `npm run build`, output `dist` | ✅ |
| **Vercel** | Connect repo → auto dari `vercel.json` | ✅ (via `vercel.json`) |

Nggak ada env var yang perlu diisi saat build — API key AI diisi user di app (BYOK).
