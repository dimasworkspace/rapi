import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
