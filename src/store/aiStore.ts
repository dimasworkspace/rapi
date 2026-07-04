import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AiProvider = 'anthropic' | 'openai' | 'google' | 'openrouter' | 'custom'

export interface AiProviderMeta {
  id: AiProvider
  label: string
  defaultModel: string
  keyHint: string
  keyUrl: string
  /** Butuh base URL manual (OpenAI-compatible: OpenRouter, Groq, LM Studio, dll). */
  needsBaseUrl?: boolean
}

/** Provider AI yang didukung — BYOK, bebas pilih. */
export const AI_PROVIDERS: AiProviderMeta[] = [
  {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    defaultModel: 'claude-3-5-sonnet-latest',
    keyHint: 'sk-ant-...',
    keyUrl: 'console.anthropic.com',
  },
  {
    id: 'openai',
    label: 'OpenAI (GPT)',
    defaultModel: 'gpt-4o-mini',
    keyHint: 'sk-...',
    keyUrl: 'platform.openai.com',
  },
  {
    id: 'google',
    label: 'Google Gemini',
    defaultModel: 'gemini-1.5-flash',
    keyHint: 'AIza...',
    keyUrl: 'aistudio.google.com',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    keyHint: 'sk-or-...',
    keyUrl: 'openrouter.ai/keys',
  },
  {
    id: 'custom',
    label: 'Lainnya (OpenAI-compatible)',
    defaultModel: '',
    keyHint: 'API key',
    keyUrl: '',
    needsBaseUrl: true,
  },
]

export const providerMeta = (id: AiProvider): AiProviderMeta =>
  AI_PROVIDERS.find((p) => p.id === id) ?? AI_PROVIDERS[0]

interface AiState {
  provider: AiProvider
  apiKey: string
  model: string
  baseUrl: string // untuk provider custom / OpenAI-compatible
  setProvider: (p: AiProvider) => void
  setApiKey: (key: string) => void
  setModel: (model: string) => void
  setBaseUrl: (url: string) => void
}

/** Konfigurasi AI (BYOK) — semua disimpan lokal, tak pernah dikirim ke server kita. */
export const useAiStore = create<AiState>()(
  persist(
    (set) => ({
      provider: 'anthropic',
      apiKey: '',
      model: providerMeta('anthropic').defaultModel,
      baseUrl: '',
      setProvider: (provider) =>
        set({ provider, model: providerMeta(provider).defaultModel }),
      setApiKey: (apiKey) => set({ apiKey: apiKey.trim() }),
      setModel: (model) => set({ model }),
      setBaseUrl: (baseUrl) => set({ baseUrl: baseUrl.trim() }),
    }),
    { name: 'rapi-ai' },
  ),
)
