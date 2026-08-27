import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Klien Supabase — SENGAJA opsional.
// Kalau env belum diisi, app jalan mode lokal (LocalStorage) seperti sebelumnya.
// Jadi deploy yang belum dikonfigurasi tidak rusak, cuma tanpa fitur akun.

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

const FETCH_TIMEOUT_MS = 10_000

const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    window.clearTimeout(timeout)
  })
}

/** Backend aktif? Dipakai UI buat memutuskan tampilkan login atau mode lokal. */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // wajib buat callback OAuth Google
      },
      global: { fetch: fetchWithTimeout },
    })
  : null

/** Ambil klien, lempar error jelas kalau dipanggil saat backend mati. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di .env.local',
    )
  }
  return supabase
}
