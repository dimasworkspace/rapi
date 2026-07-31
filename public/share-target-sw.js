// Rapi — penerima kiriman foto struk dari app lain (Android share sheet).
//
// Kenapa file terpisah: manifest `share_target` dengan method POST harus
// ditangani service worker, sedangkan SW Rapi digenerate otomatis oleh Workbox.
// File ini disisipkan lewat `workbox.importScripts` di vite.config.ts.
//
// Alur: app lain kirim foto → SW tangkap POST /bagikan → simpan file di Cache
// Storage → redirect ke /?aksi=struk → app memungutnya dan langsung memindai.

const RAPI_SHARE_CACHE = 'rapi-share'
const RAPI_SHARE_KEY = '/__struk-dibagikan'

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'POST' || url.pathname !== '/app/bagikan') return

  event.respondWith(
    (async () => {
      try {
        const form = await event.request.formData()
        const file = form.get('foto')
        if (file && typeof file !== 'string' && file.size > 0) {
          const cache = await caches.open(RAPI_SHARE_CACHE)
          await cache.put(
            RAPI_SHARE_KEY,
            new Response(file, {
              headers: { 'Content-Type': file.type || 'image/jpeg' },
            }),
          )
          return Response.redirect('/app/?aksi=struk', 303)
        }
      } catch (err) {
        // Kiriman gagal dibaca — jangan biarkan user mendarat di layar error.
        console.error('[rapi] gagal baca kiriman struk:', err)
      }
      return Response.redirect('/app/', 303)
    })(),
  )
})
