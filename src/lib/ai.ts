import { supabase } from '@/lib/supabase'
import { providerMeta, useAiStore, type AiProvider } from '@/store/aiStore'
import { useAuthStore } from '@/store/authStore'

// Integrasi AI Rapi — BYOK multi-provider, semua request langsung dari browser
// (key user nggak pernah lewat server kita). Pakai fetch polos (bukan SDK)
// biar satu lapisan seragam untuk semua provider & bundle tetap ramping.

export interface AiChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AiReceiptResult {
  amount: number | null
  note: string
  category: string | null
  type: 'income' | 'expense'
}

/** Error dengan pesan ramah ala Rapi — siap ditampilkan langsung ke user. */
export class RapiAiError extends Error {}

interface AiConfig {
  provider: AiProvider
  apiKey: string
  model: string
  baseUrl: string
}

const getConfig = (): AiConfig => {
  const { provider, apiKey, model, baseUrl } = useAiStore.getState()
  return { provider, apiKey, model: model || providerMeta(provider).defaultModel, baseUrl }
}

/** Pakai proxy server? (login + backend aktif + user belum pasang key sendiri) */
export const usingServerAi = (): boolean =>
  Boolean(supabase) &&
  useAuthStore.getState().user !== null &&
  useAiStore.getState().apiKey.trim() === ''

/** Sudah siap dipakai? Lewat proxy server ATAU key sendiri. */
export const aiReady = (): boolean =>
  usingServerAi() || useAiStore.getState().apiKey.trim() !== ''

const friendlyError = (status: number): RapiAiError => {
  if (status === 401 || status === 403)
    return new RapiAiError('API key-nya nggak diterima nih. Cek lagi di Profil ya 🔑')
  if (status === 404)
    return new RapiAiError('Model-nya nggak ketemu. Cek nama model di Profil ya 🤔')
  if (status === 429)
    return new RapiAiError('Kebanyakan request nih, tarik napas dulu terus coba lagi ya 😮‍💨')
  if (status === 529 || status >= 500)
    return new RapiAiError('Server AI-nya lagi sibuk. Coba lagi bentar lagi ya 😊')
  return new RapiAiError('Oops, ada yang salah nih. Coba lagi ya 😊')
}

const postJson = async (url: string, headers: Record<string, string>, body: unknown) => {
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
    })
  } catch {
    throw new RapiAiError('Nggak bisa nyambung ke provider AI. Cek internetmu ya 📶')
  }
  if (!res.ok) throw friendlyError(res.status)
  return res.json()
}

// ===== Anthropic (Claude) =====

interface AnthropicContentBlock {
  type: string
  text?: string
}

const callAnthropic = async (
  cfg: AiConfig,
  system: string,
  messages: AiChatMessage[],
  image?: { data: string; mediaType: string },
): Promise<string> => {
  const apiMessages = messages.map((m, i) => {
    // Gambar (struk) nempel di pesan user terakhir, sebelum teksnya
    if (image && i === messages.length - 1 && m.role === 'user') {
      return {
        role: m.role,
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: image.mediaType, data: image.data },
          },
          { type: 'text', text: m.content },
        ],
      }
    }
    return { role: m.role, content: m.content }
  })

  const data = await postJson(
    'https://api.anthropic.com/v1/messages',
    {
      'x-api-key': cfg.apiKey,
      'anthropic-version': '2023-06-01',
      // Izinkan call langsung dari browser (BYOK) — tanpa ini kena CORS
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    { model: cfg.model, max_tokens: 1024, system, messages: apiMessages },
  )

  if (data.stop_reason === 'refusal') {
    throw new RapiAiError('Rapi AI nggak bisa jawab yang itu. Tanya soal keuanganmu aja ya 😊')
  }
  const blocks: AnthropicContentBlock[] = data.content ?? []
  const text = blocks
    .filter((b) => b.type === 'text' && b.text)
    .map((b) => b.text)
    .join('\n')
    .trim()
  if (!text) throw new RapiAiError('Jawabannya kosong nih. Coba tanya lagi ya 😊')
  return text
}

// ===== OpenAI-compatible (OpenAI, OpenRouter, custom) =====

const OPENAI_BASE: Record<string, string> = {
  groq: 'https://api.groq.com/openai/v1',
  openai: 'https://api.openai.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
}

const callOpenAiCompatible = async (
  cfg: AiConfig,
  system: string,
  messages: AiChatMessage[],
  image?: { data: string; mediaType: string },
): Promise<string> => {
  const base = (cfg.provider === 'custom' ? cfg.baseUrl : OPENAI_BASE[cfg.provider]).replace(
    /\/$/,
    '',
  )
  if (!base) throw new RapiAiError('Base URL-nya belum diisi. Lengkapi di Profil dulu ya ✍️')

  const apiMessages: unknown[] = [
    { role: 'system', content: system },
    ...messages.map((m, i) => {
      if (image && i === messages.length - 1 && m.role === 'user') {
        return {
          role: m.role,
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${image.mediaType};base64,${image.data}` },
            },
            { type: 'text', text: m.content },
          ],
        }
      }
      return { role: m.role, content: m.content }
    }),
  ]

  const data = await postJson(
    `${base}/chat/completions`,
    { authorization: `Bearer ${cfg.apiKey}` },
    { model: cfg.model, max_tokens: 1024, messages: apiMessages },
  )
  const text: string = data.choices?.[0]?.message?.content?.trim() ?? ''
  if (!text) throw new RapiAiError('Jawabannya kosong nih. Coba tanya lagi ya 😊')
  return text
}

// ===== Google Gemini =====

const callGemini = async (
  cfg: AiConfig,
  system: string,
  messages: AiChatMessage[],
  image?: { data: string; mediaType: string },
): Promise<string> => {
  const contents = messages.map((m, i) => {
    const parts: unknown[] = []
    if (image && i === messages.length - 1 && m.role === 'user') {
      parts.push({ inline_data: { mime_type: image.mediaType, data: image.data } })
    }
    parts.push({ text: m.content })
    return { role: m.role === 'assistant' ? 'model' : 'user', parts }
  })

  const data = await postJson(
    `https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent`,
    { 'x-goog-api-key': cfg.apiKey },
    {
      system_instruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { maxOutputTokens: 1024 },
    },
  )
  const parts: { text?: string }[] = data.candidates?.[0]?.content?.parts ?? []
  const text = parts
    .map((p) => p.text ?? '')
    .join('')
    .trim()
  if (!text) throw new RapiAiError('Jawabannya kosong nih. Coba tanya lagi ya 😊')
  return text
}

// ===== Proxy server (Edge Function) =====

/** Sisa kuota harian dari respons terakhir — dipakai UI Settings. */
export interface AiQuota {
  used: number
  quota: number
}
let lastQuota: AiQuota | null = null
export const getLastQuota = (): AiQuota | null => lastQuota

/** Lewat Edge Function: key ada di server, user nggak perlu punya key sendiri. */
const callServerProxy = async (
  system: string,
  messages: AiChatMessage[],
  image?: { data: string; mediaType: string },
): Promise<string> => {
  const { data, error } = await requireInvoke(system, messages, image)

  if (error) {
    // supabase-js membungkus error HTTP; baca body-nya buat pesan yang tepat
    const status = (error as { context?: { status?: number } }).context?.status
    if (status === 429) {
      throw new RapiAiError(
        'Kuota AI harianmu sudah habis nih. Coba lagi besok, atau pasang API key sendiri di Profil buat tanpa batas 😊',
      )
    }
    if (status === 401) throw new RapiAiError('Sesimu berakhir. Coba masuk ulang ya 🔑')
    if (status === 500) throw new RapiAiError('Fitur AI belum disetel pemilik app. Coba lagi nanti ya 😊')
    throw new RapiAiError('Server AI lagi sibuk. Coba lagi bentar ya 😊')
  }

  const res = data as { text?: string; used?: number; quota?: number }
  if (typeof res?.used === 'number' && typeof res?.quota === 'number') {
    lastQuota = { used: res.used, quota: res.quota }
  }
  if (!res?.text) throw new RapiAiError('Jawabannya kosong nih. Coba tanya lagi ya 😊')
  return res.text
}

const requireInvoke = (
  system: string,
  messages: AiChatMessage[],
  image?: { data: string; mediaType: string },
) => {
  if (!supabase) throw new RapiAiError('Fitur AI butuh koneksi ke server. Coba lagi nanti ya 😊')
  return supabase.functions.invoke('ai', { body: { system, messages, image } })
}

// ===== API publik =====

/** Chat ke AI. Pakai proxy server kalau login; kalau user pasang key sendiri, pakai itu. */
export async function chatWithAi(
  system: string,
  messages: AiChatMessage[],
  image?: { data: string; mediaType: string },
): Promise<string> {
  const cfg = getConfig()

  // Key sendiri menang — dianggap mode "unlimited"
  if (!cfg.apiKey) {
    if (usingServerAi()) return callServerProxy(system, messages, image)
    throw new RapiAiError('API key-nya belum diisi. Yuk lengkapi dulu di Profil 🔑')
  }

  if (cfg.provider === 'anthropic') return callAnthropic(cfg, system, messages, image)
  if (cfg.provider === 'google') return callGemini(cfg, system, messages, image)
  return callOpenAiCompatible(cfg, system, messages, image)
}

/** Parse foto struk jadi transaksi terstruktur via AI vision. */
export async function parseReceiptWithAi(
  imageBase64: string,
  mediaType: string,
  categoryIds: string[],
): Promise<AiReceiptResult> {
  const system =
    'Kamu adalah parser struk belanja untuk aplikasi keuangan Indonesia. ' +
    'Balas HANYA dengan JSON valid tanpa markdown, dengan bentuk: ' +
    '{"amount": number, "note": string, "category": string, "type": "income"|"expense"}. ' +
    `"category" wajib salah satu dari: ${categoryIds.join(', ')}. ` +
    '"amount" adalah total akhir dalam Rupiah (angka bulat). ' +
    '"note" singkat, contoh: "Belanja Indomaret". Kalau bukan struk, amount = 0.'

  const raw = await chatWithAi(
    system,
    [{ role: 'user', content: 'Baca struk ini dan balas JSON-nya.' }],
    { data: imageBase64, mediaType },
  )

  // Amanin kalau model tetap bungkus pakai ```json ... ```
  const jsonText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    const parsed = JSON.parse(jsonText) as Partial<AiReceiptResult>
    const amount = typeof parsed.amount === 'number' && parsed.amount > 0 ? parsed.amount : null
    return {
      amount,
      note: typeof parsed.note === 'string' ? parsed.note : '',
      category:
        typeof parsed.category === 'string' && categoryIds.includes(parsed.category)
          ? parsed.category
          : null,
      type: parsed.type === 'income' ? 'income' : 'expense',
    }
  } catch {
    throw new RapiAiError('Struknya susah kebaca nih. Coba foto ulang yang lebih jelas ya 📸')
  }
}
