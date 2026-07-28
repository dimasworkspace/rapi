// Rapi — Proxy AI (Supabase Edge Function, Deno)
//
// Kenapa ada: supaya user TIDAK perlu bikin API key sendiri, dan key milik
// pemilik app tidak pernah kelihatan di browser.
//
// Alur: verifikasi JWT user → pakai 1 jatah kuota harian → panggil provider
// pakai key server → balikin teksnya saja.
//
// Secret yang perlu diset (Dashboard → Edge Functions → Secrets):
//   AI_API_KEY   (wajib)  key provider — mis. Gemini atau Groq
//   AI_PROVIDER  (opsi)   'gemini' (default) | 'groq'
//   AI_MODEL     (opsi)   override nama model
//   AI_DAILY_LIMIT (opsi) default 30

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
interface Payload {
  system: string
  messages: ChatMessage[]
  image?: { data: string; mediaType: string }
}

const PROVIDER = (Deno.env.get('AI_PROVIDER') ?? 'gemini').toLowerCase()
const API_KEY = Deno.env.get('AI_API_KEY') ?? ''
const DAILY_LIMIT = Number(Deno.env.get('AI_DAILY_LIMIT') ?? '30')
const MODEL =
  Deno.env.get('AI_MODEL') ??
  // Catatan 28 Jul 2026: gemini-2.0-flash sudah tidak punya jatah free tier
  // (API balas 429 "limit: 0"), jadi default digeser ke model flash terbaru
  // yang masih gratis dan tetap mendukung vision buat scan struk.
  (PROVIDER === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-3.6-flash')

// ---------- Provider ----------

async function callGemini(p: Payload): Promise<string> {
  const contents = p.messages.map((m, i) => {
    const parts: unknown[] = []
    if (p.image && i === p.messages.length - 1 && m.role === 'user') {
      parts.push({ inline_data: { mime_type: p.image.mediaType, data: p.image.data } })
    }
    parts.push({ text: m.content })
    return { role: m.role === 'assistant' ? 'model' : 'user', parts }
  })

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: p.system }] },
        contents,
        generationConfig: { maxOutputTokens: 1024 },
      }),
    },
  )
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  const parts: { text?: string }[] = data.candidates?.[0]?.content?.parts ?? []
  return parts.map((x) => x.text ?? '').join('').trim()
}

async function callGroq(p: Payload): Promise<string> {
  const messages: unknown[] = [
    { role: 'system', content: p.system },
    ...p.messages.map((m, i) => {
      if (p.image && i === p.messages.length - 1 && m.role === 'user') {
        return {
          role: m.role,
          content: [
            { type: 'image_url', image_url: { url: `data:${p.image.mediaType};base64,${p.image.data}` } },
            { type: 'text', text: m.content },
          ],
        }
      }
      return { role: m.role, content: m.content }
    }),
  ]

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, max_tokens: 1024, messages }),
  })
  if (!res.ok) throw new Error(`groq ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return (data.choices?.[0]?.message?.content ?? '').trim()
}

// ---------- Handler ----------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
  if (!API_KEY) return json({ error: 'not_configured' }, 500)

  // 1) Wajib login — tanpa JWT valid, tolak.
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )
  const { data: userData, error: userErr } = await db.auth.getUser()
  if (userErr || !userData.user) return json({ error: 'unauthorized' }, 401)

  // 2) Kuota harian — atomik di database, bukan di sini.
  const { data: quota, error: quotaErr } = await db
    .rpc('consume_ai_quota', { p_limit: DAILY_LIMIT })
    .single()
  if (quotaErr) return json({ error: 'quota_check_failed' }, 500)

  const q = quota as { allowed: boolean; used: number; quota: number }
  if (!q.allowed) return json({ error: 'quota_exceeded', used: q.used, quota: q.quota }, 429)

  // 3) Panggil provider pakai key server
  let payload: Payload
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'bad_request' }, 400)
  }
  if (!payload?.system || !Array.isArray(payload.messages)) {
    return json({ error: 'bad_request' }, 400)
  }

  try {
    const text = PROVIDER === 'groq' ? await callGroq(payload) : await callGemini(payload)
    if (!text) return json({ error: 'empty_response' }, 502)
    return json({ text, used: q.used, quota: q.quota })
  } catch (e) {
    console.error('[ai] gagal:', e)
    return json({ error: 'provider_error' }, 502)
  }
})
