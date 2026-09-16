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

const REMEMBER_LOGIN_KEY = 'rapi-remember-login'
const sessionMemory = new Map<string, string>()

const shouldRememberLogin = (): boolean => localStorage.getItem(REMEMBER_LOGIN_KEY) !== 'false'

const authStorage = {
  getItem: (key: string): string | null =>
    shouldRememberLogin() ? localStorage.getItem(key) : (sessionMemory.get(key) ?? null),
  setItem: (key: string, value: string): void => {
    if (shouldRememberLogin()) localStorage.setItem(key, value)
    else sessionMemory.set(key, value)
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key)
    sessionMemory.delete(key)
  },
}

/** Atur apakah sesi auth boleh bertahan setelah browser ditutup. */
export function setRememberLogin(remember: boolean): void {
  localStorage.setItem(REMEMBER_LOGIN_KEY, String(remember))
  if (!remember) {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index)
      if (key?.startsWith('sb-')) localStorage.removeItem(key)
    }
  }
}

/** Backend aktif? Dipakai UI buat memutuskan tampilkan login atau mode lokal. */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // wajib buat callback OAuth Google
        storage: authStorage,
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
