// Rakit satu situs dari dua build terpisah.
//
// Kenapa digabung: browser cuma mengizinkan sebuah halaman memasang PWA milik
// ORIGIN-NYA SENDIRI. Selama landing page dan app beda domain, tombol "Pasang"
// di landing page mustahil berfungsi — bukan kurang kode, tapi batasan
// keamanan browser. Satu-satunya jalan adalah menyatukan keduanya:
//
//   dist/            <- landing page (Astro)
//   dist/app/        <- aplikasi (Vite, base "/app/")
//
// Urutannya penting: app dibangun DULU ke dist/, lalu dipindahkan ke dist/app/,
// baru landing page ditumpahkan ke akar. Kebalikannya bikin `vite build`
// menghapus isi dist/ yang sudah ada.

import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const akar = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(akar, 'dist')
const sementara = path.join(akar, '.dist-app')
const landing = path.join(akar, 'Landing Page Rapi')

const jalan = (perintah, cwd = akar) => {
  console.log(`\n$ ${perintah}`)
  execSync(perintah, { cwd, stdio: 'inherit' })
}

// 1) App -> dist/, lalu diamankan ke .dist-app/
rmSync(dist, { recursive: true, force: true })
rmSync(sementara, { recursive: true, force: true })
jalan('npm run build:app')
renameSync(dist, sementara)

// 2) Landing page -> "Landing Page Rapi"/dist
jalan('npm ci --include=dev', landing)
jalan('npm run build', landing)

// 3) Landing ke akar dist/, app ke dist/app/
mkdirSync(dist, { recursive: true })
cpSync(path.join(landing, 'dist'), dist, { recursive: true })
cpSync(sementara, path.join(dist, 'app'), { recursive: true })
rmSync(sementara, { recursive: true, force: true })

// 4) Sanity check — gagal keras daripada mengirim situs rusak diam-diam.
const wajib = [
  'index.html', // landing
  'app/index.html', // app
  'app/manifest.webmanifest',
  'app/sw.js',
]
const hilang = wajib.filter((f) => !existsSync(path.join(dist, f)))
if (hilang.length) {
  console.error('\n✗ Berkas wajib tidak ada di dist/:', hilang.join(', '))
  process.exit(1)
}

console.log('\n✓ Situs gabungan siap di dist/  (landing di "/", app di "/app/")')
