import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AiState {
  /** Anthropic API key milik user (BYOK) — disimpan lokal, tak pernah dikirim ke server kita. */
  apiKey: string
  setApiKey: (key: string) => void
}

export const useAiStore = create<AiState>()(
  persist(
    (set) => ({
      apiKey: '',
      setApiKey: (apiKey) => set({ apiKey: apiKey.trim() }),
    }),
    { name: 'rapi-ai' },
  ),
)
