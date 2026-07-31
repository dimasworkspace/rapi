import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

// Landing page rapi.app — situs statis murni, tanpa server.
// site: dipakai buat bikin URL absolut di sitemap & tag Open Graph.
// Ganti kalau nanti sudah punya domain sendiri (mis. https://rapi.app).
export default defineConfig({
  site: 'https://rapi-landing.vercel.app',
  integrations: [tailwind()],
  build: {
    // Bikin /fitur/index.html, bukan /fitur.html — lebih rapi di URL
    format: 'directory',
  },
})
