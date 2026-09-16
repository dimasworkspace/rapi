// Satu tempat buat semua angka & tautan yang berubah-ubah.
// Kalau domain app pindah atau nama fitur berganti, cukup ubah di sini —
// jangan sebar hardcode ke banyak file.

/**
 * Alamat app. RELATIF, bukan absolut — landing page dan app sekarang satu
 * origin (landing di "/", app di "/app/"). Itu bukan pilihan gaya: browser
 * cuma mengizinkan sebuah halaman memasang PWA milik origin-nya sendiri,
 * jadi tombol "Pasang" di landing page mustahil bekerja kalau app-nya di
 * domain lain.
 */
export const APP_URL = '/app/'

export const SITE = {
  name: 'Rapi',
  tagline: 'Catat keuangan tanpa ribet.',
  hashtag: '#RapiinAja',
  description:
    'Catat keuangan secepat ngetik chat. Tulis, ngomong, atau foto struk — Rapi membaca nominal dan merapikan catatanmu. Gratis di HP dan laptop.',
  locale: 'id_ID',
} as const

/** Navigasi header. Semua mengarah ke section di halaman yang sama. */
export const NAV = [
  { label: 'Kenapa Rapi', href: '#kenapa' },
  { label: 'Fitur', href: '#fitur' },
  { label: 'Cara Pakai', href: '#cara-pakai' },
  { label: 'Tanya Jawab', href: '#faq' },
] as const
