import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { isSupabaseConfigured, requireSupabase, supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  /** true selama cek sesi awal — cegah kedip layar login sebelum sesi kebaca. */
  loading: boolean
  /** Terisi kalau daftar via email butuh konfirmasi. */
  pendingEmail: string | null
  init: () => void
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearPendingEmail: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  session: null,
  // Mode lokal (tanpa backend): nggak ada yang perlu ditunggu
  loading: isSupabaseConfigured,
  pendingEmail: null,

  init: () => {
    if (!supabase) {
      set({ loading: false })
      return
    }
    // Sesi tersimpan (mis. habis reload / balik dari OAuth Google)
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, user: data.session?.user ?? null, loading: false })
    })
    // Ikuti perubahan: login, logout, token refresh
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false })
    })
  },

  signInWithGoogle: async () => {
    const { error } = await requireSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  },

  signInWithEmail: async (email, password) => {
    const { error } = await requireSupabase().auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  signUpWithEmail: async (email, password) => {
    const { data, error } = await requireSupabase().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
    // Kalau tidak langsung dapat sesi, artinya perlu konfirmasi email dulu
    if (!data.session) set({ pendingEmail: email })
  },

  signOut: async () => {
    await requireSupabase().auth.signOut()
    set({ user: null, session: null })
  },

  clearPendingEmail: () => set({ pendingEmail: null }),
}))
