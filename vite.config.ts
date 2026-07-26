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
  plugins: [
    react(),
    cspPlugin(),
    // PWA: installable ke home screen + jalan offline (service worker)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'rapi-mascot.png'],
      manifest: {
        name: 'Rapi — Catat Keuangan Tanpa Ribet',
        short_name: 'Rapi',
        description:
          'Catat keuangan tanpa ribet — ketik, ngomong, atau foto struk, langsung rapi. #RapiinAja',
        lang: 'id',
        theme_color: '#111835',
        background_color: '#FBFCFC',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: '/index.html',
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
