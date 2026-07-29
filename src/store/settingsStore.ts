import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'
export type Lang = 'id' | 'en'

interface SettingsState {
  theme: Theme
  lang: Lang
  /** Sembunyikan nominal di Dashboard — buat dipakai di tempat ramai. */
  hideBalance: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setLang: (lang: Lang) => void
  toggleHideBalance: () => void
}

/** Terapkan tema ke <html>: class 'dark' untuk Tailwind + warna status bar. */
const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', theme === 'dark' ? '#0B1020' : '#111835')
}

/** Terapkan bahasa ke atribut <html lang>. */
const applyLang = (lang: Lang) => {
  document.documentElement.setAttribute('lang', lang)
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      lang: 'id',
      hideBalance: false,
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      toggleTheme: () =>
        set((s) => {
          const next: Theme = s.theme === 'dark' ? 'light' : 'dark'
          applyTheme(next)
          return { theme: next }
        }),
      setLang: (lang) => {
        applyLang(lang)
        set({ lang })
      },
      toggleHideBalance: () => set((s) => ({ hideBalance: !s.hideBalance })),
    }),
    {
      name: 'rapi-settings',
      onRehydrateStorage: () => (state) => {
        // Sinkronkan DOM dengan preferensi tersimpan setelah hydrate
        if (state) {
          applyTheme(state.theme)
          applyLang(state.lang)
        }
      },
    },
  ),
)
