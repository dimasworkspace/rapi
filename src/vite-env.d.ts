/// <reference types="vite/client" />

// Env yang dipakai app. Keduanya opsional — kalau kosong, app jalan mode lokal.
// CATATAN: anon key memang aman ditaruh di client (dilindungi Row Level Security).
// JANGAN pernah menaruh service_role key di sini.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
