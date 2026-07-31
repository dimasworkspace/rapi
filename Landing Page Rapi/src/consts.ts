// Satu tempat buat semua angka & tautan yang berubah-ubah.
// Kalau domain app pindah atau nama fitur berganti, cukup ubah di sini —
// jangan sebar hardcode ke banyak file.

/** Alamat app Rapi yang sudah hidup. Ganti kalau nanti pindah domain. */
export const APP_URL = 'https://rapi-8ho7.vercel.app'

export const SITE = {
  name: 'Rapi',
  tagline: 'Catat keuangan tanpa ribet.',
  hashtag: '#RapiinAja',
  description:
    'Rapi bikin nyatat keuangan segampang ngobrol. Ketik, ngomong, atau foto struk — langsung kecatat rapi. Gratis, jalan di HP mana aja.',
  locale: 'id_ID',
} as const

/** Navigasi header. Semua mengarah ke section di halaman yang sama. */
export const NAV = [
  { label: 'Kenapa Rapi', href: '#kenapa' },
  { label: 'Fitur', href: '#fitur' },
  { label: 'Cara Pakai', href: '#cara-pakai' },
  { label: 'Tanya Jawab', href: '#faq' },
] as const
