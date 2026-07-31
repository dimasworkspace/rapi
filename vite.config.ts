import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Content-Security-Policy — disuntik HANYA saat build produksi biar HMR dev
// nggak kena. connect-src pakai https: karena provider AI custom (BYOK) boleh
// base URL bebas. Directive header-only (frame-ancestors dll) ada di public/_headers.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const cspPlugin = (): Plugin => ({
  name: 'rapi-csp',
  apply: 'build',
  transformIndexHtml() {
    return [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
        injectTo: 'head-prepend',
      },
    ]
  },
})

// https://vite.dev/config/
export default defineConfig({
  // App disajikan di /app, landing page (Astro) yang memegang "/".
  // Satu origin itu WAJIB: browser cuma mengizinkan sebuah halaman memasang
  // PWA milik origin-nya sendiri, jadi tombol "Pasang" di landing page baru
  // bisa berfungsi kalau app-nya satu domain dengannya.
  base: '/app/',
  plugins: [
    react(),
    cspPlugin(),
    // PWA: installable ke home screen + jalan offline (service worker)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon-16.png',
        'favicon-32.png',
        'apple-touch-icon.png',
        'rapi-mascot.png',
      ],
      manifest: {
        name: 'Rapi — Catat Keuangan Tanpa Ribet',
        short_name: 'Rapi',
        description:
          'Catat keuangan tanpa ribet — ketik, ngomong, atau foto struk, langsung rapi. #RapiinAja',
        lang: 'id',
        theme_color: '#111835',
        background_color: '#FBFCFC',
        display: 'standalone',
        // start_url ke /app/ (app-nya), tapi scope tetap "/" supaya halaman
        // landing di akar domain ikut masuk jangkauan manifest. Tanpa itu
        // browser nggak akan menawarkan pemasangan dari landing page.
        start_url: '/app/',
        scope: '/',
        id: '/app/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Tahan ikon Rapi di home screen → aksi utama langsung muncul, tanpa
        // perlu buka app dulu lalu cari tombol +.
        shortcuts: [
          {
            name: 'Catat transaksi',
            short_name: 'Catat',
            description: 'Langsung buka form tambah transaksi',
            url: '/app/?aksi=catat',
            icons: [{ src: 'pwa-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
        // Rapi muncul di share sheet HP: habis foto struk, Bagikan → Rapi →
        // langsung dipindai. Pencatatan bisa dimulai dari luar app.
        share_target: {
          action: '/app/bagikan',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            files: [{ name: 'foto', accept: ['image/*'] }],
          },
        },
      },
      // Service worker didaftarkan dengan scope "/" walau file-nya ada di
      // /app/sw.js. Butuh header Service-Worker-Allowed: / (lihat vercel.json).
      // Tanpa scope seluas ini, halaman landing di akar nggak dikuasai SW dan
      // browser nggak akan menawarkan pemasangan di sana.
      scope: '/',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: '/app/index.html',
        // PENTING: fallback SPA cuma berlaku di bawah /app/. Tanpa batas ini,
        // permintaan ke "/" (landing page) ikut dilempar ke cangkang app —
        // landing page-nya hilang begitu offline.
        navigateFallbackAllowlist: [/^\/app\//],
        // Penangan POST /app/bagikan (share target) — Workbox nggak bisa bikin
        // ini sendiri, jadi disisipkan sebagai script terpisah.
        importScripts: ['/app/share-target-sw.js'],
        // Maskot PNG lumayan gede — izinkan masuk precache
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            // Google Fonts: cache-first biar offline tetap ada font
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'rapi-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Hormatin env PORT (dipakai harness preview saat autoPort aktif),
    // fallback ke 5173 buat `npm run dev` biasa.
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
