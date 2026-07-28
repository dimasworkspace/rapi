// Pintu masuk Rapi dari LUAR app — dua jalur, dua-duanya lewat query `?aksi=`:
//
//   ?aksi=catat  → shortcut di ikon home screen (manifest `shortcuts`)
//   ?aksi=struk  → foto struk dikirim dari app lain (manifest `share_target`);
//                  file-nya sudah dititipkan service worker di Cache Storage
//
// Dipanggil sekali saat app boot. Query-nya langsung dibersihkan dari URL biar
// refresh nggak memicu aksi yang sama dua kali.

const SHARE_CACHE = 'rapi-share'
const SHARE_KEY = '/__struk-dibagikan'

export interface LaunchIntent {
  action: 'catat' | 'struk'
  /** Terisi hanya untuk 'struk' — dan bisa null kalau file-nya gagal dipungut. */
  photo: File | null
}

/** Ambil foto yang dititipkan service worker, lalu hapus titipannya. */
const takeSharedPhoto = async (): Promise<File | null> => {
  if (!('caches' in window)) return null
  try {
    const cache = await caches.open(SHARE_CACHE)
    const res = await cache.match(SHARE_KEY)
    if (!res) return null
    await cache.delete(SHARE_KEY)
    const blob = await res.blob()
    if (blob.size === 0) return null
    return new File([blob], 'struk.jpg', { type: blob.type || 'image/jpeg' })
  } catch {
    return null
  }
}

export const consumeLaunchIntent = async (): Promise<LaunchIntent | null> => {
  const params = new URLSearchParams(window.location.search)
  const aksi = params.get('aksi')
  if (aksi !== 'catat' && aksi !== 'struk') return null

  // Bersihkan URL dulu supaya aksi ini nggak terulang saat user refresh
  params.delete('aksi')
  const rest = params.toString()
  window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : ''))

  if (aksi === 'catat') return { action: 'catat', photo: null }
  return { action: 'struk', photo: await takeSharedPhoto() }
}
