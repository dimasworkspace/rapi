import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, Settings2, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiMascot } from '@/components/rapi/RapiMascot'
import { chatWithAi, RapiAiError } from '@/lib/ai'
import { formatRupiah } from '@/lib/formatters'
import { SPRING_SOFT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { useAiStore } from '@/store/aiStore'
import { sortByDateDesc, useTransactionStore } from '@/store/transactionStore'
import { useUserStore } from '@/store/userStore'
import { DEFAULT_CATEGORIES } from '@/types'

const SUGGESTIONS = [
  'Gimana keuanganku bulan ini?',
  'Pengeluaran terbesar aku apa?',
  'Kasih tips hemat dong 💡',
  'Aku boros nggak sih?',
]

/** Bangun system prompt: personality Rapi AI + konteks keuangan user yang sebenarnya. */
const buildSystemPrompt = (
  name: string,
  balance: number,
  monthIncome: number,
  monthExpense: number,
  recentLines: string[],
): string =>
  [
    `Kamu adalah Rapi AI, teman finansial yang asyik buat ${name}.`,
    'Kamu santai, fun, dan nggak pernah judge keputusan finansial user.',
    'Selalu positif, encouraging, dan pakai bahasa yang mudah dimengerti.',
    'Sesekali boleh bercanda ringan tapi tetap informatif dan helpful.',
    'Panggil user dengan "kamu" bukan "Anda".',
    'Gunakan emoji sesekali untuk bikin suasana lebih fun.',
    'Jawaban selalu berbasis data transaksi user di bawah ini, bukan generic.',
    'Jawab ringkas (2-5 kalimat) kecuali diminta detail. Jangan pakai heading markdown.',
    '',
    `=== Data keuangan ${name} (real, dari aplikasi) ===`,
    `Total saldo: ${formatRupiah(balance)}`,
    `Pemasukan bulan ini: ${formatRupiah(monthIncome)}`,
    `Pengeluaran bulan ini: ${formatRupiah(monthExpense)}`,
    'Transaksi terakhir:',
    ...(recentLines.length > 0 ? recentLines : ['(belum ada transaksi)']),
  ].join('\n')

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1" aria-label="Rapi AI lagi ngetik">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-rapi-blue"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

export default function AIChat() {
  const profile = useUserStore((s) => s.profile)
  const transactions = useTransactionStore((s) => s.transactions)
  const apiKey = useAiStore((s) => s.apiKey)
  const chat = useAiStore((s) => s.chat)
  const addChat = useAiStore((s) => s.addChat)
  const clearChat = useAiStore((s) => s.clearChat)

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const name = profile?.name ?? 'Kamu'
  const hasKey = apiKey.trim() !== ''

  const systemPrompt = useMemo(() => {
    const initial = profile?.initialBalance ?? 0
    const now = new Date()
    let income = 0
    let expense = 0
    let inMonth = 0
    let outMonth = 0
    for (const tx of transactions) {
      if (tx.type === 'income') income += tx.amount
      if (tx.type === 'expense') expense += tx.amount
      const d = new Date(tx.date)
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        if (tx.type === 'income') inMonth += tx.amount
        if (tx.type === 'expense') outMonth += tx.amount
      }
    }
    const recentLines = sortByDateDesc(transactions)
      .slice(0, 15)
      .map((tx) => {
        const cat = DEFAULT_CATEGORIES.find((c) => c.id === tx.category)?.name ?? tx.category
        const sign = tx.type === 'income' ? '+' : '-'
        return `- ${tx.date.slice(0, 10)} ${sign}${formatRupiah(tx.amount)} ${cat}${
          tx.note ? ` (${tx.note})` : ''
        }`
      })
    return buildSystemPrompt(name, initial + income - expense, inMonth, outMonth, recentLines)
  }, [transactions, profile, name])

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.length, loading])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    setError(null)
    addChat('user', trimmed)
    setLoading(true)
    try {
      const history = [...useAiStore.getState().chat].map((m) => ({
        role: m.role,
        content: m.content,
      }))
      const reply = await chatWithAi(systemPrompt, history)
      addChat('assistant', reply)
    } catch (e) {
      setError(e instanceof RapiAiError ? e.message : 'Oops, ada yang salah nih. Coba lagi ya 😊')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100dvh-7rem)] flex-col px-5 pb-2">
      <div className="flex items-center justify-between">
        <TopBar title="Rapi AI" />
        {chat.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Hapus semua obrolan sama Rapi AI?')) clearChat()
            }}
            aria-label="Hapus obrolan"
            className="flex h-9 w-9 items-center justify-center rounded-full text-rapi-gray-600 transition-colors hover:bg-rapi-expense-soft hover:text-rapi-expense"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {!hasKey ? (
        /* Belum ada API key — arahkan ke Profil dengan ramah */
        <div className="rapi-glass animate-rapi-fade-up mt-4 flex flex-col items-center gap-3 rounded-rapi-lg px-6 py-12 text-center">
          <RapiMascot size={120} />
          <p className="mt-1 text-sm font-bold text-rapi-navy">Rapi AI siap nemenin kamu!</p>
          <p className="text-[13px] leading-relaxed text-rapi-gray-600">
            Tinggal isi API key kamu di Profil (bebas provider — Claude, GPT, Gemini, dll).
            Key-nya kesimpan di HP kamu aja kok 🔒
          </p>
          <Link to="/profil">
            <RapiButton variant="accent">
              <Settings2 size={15} />
              Isi API Key di Profil
            </RapiButton>
          </Link>
        </div>
      ) : (
        <>
          {/* Daftar pesan */}
          <div className="flex flex-1 flex-col gap-2.5 pt-1">
            {chat.length === 0 && (
              <div className="animate-rapi-fade-up mt-6 flex flex-col items-center gap-3 text-center">
                <RapiMascot size={132} />
                <p className="mt-1 text-sm font-bold text-rapi-navy">Halo, {name}! 👋</p>
                <p className="max-w-[16rem] text-[13px] leading-relaxed text-rapi-gray-600">
                  Aku Rapi AI — tanya apa aja soal keuanganmu, aku jawab berdasarkan catatanmu
                  yang beneran.
                </p>
                <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      style={{ animationDelay: `${150 + i * 70}ms` }}
                      className="animate-rapi-fade-up rounded-full border border-rapi-blue/25 bg-white/70 px-3 py-1.5 text-[12px] font-semibold text-rapi-blue transition-all hover:bg-rapi-blue hover:text-white active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chat.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_SOFT }}
                className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] whitespace-pre-wrap rounded-rapi-lg px-3.5 py-2.5 text-[13px] leading-relaxed shadow-rapi-card',
                    m.role === 'user'
                      ? 'rounded-br-md bg-gradient-to-br from-rapi-blue to-[#0334A0] text-white'
                      : 'rapi-glass rounded-bl-md text-rapi-navy',
                  )}
                >
                  {m.role === 'assistant' && (
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-rapi-blue">
                      Rapi AI
                    </p>
                  )}
                  {m.content}
                </div>
              </motion.div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rapi-glass rounded-rapi-lg rounded-bl-md px-3.5 py-2.5">
                  <TypingDots />
                </div>
              </div>
            )}

            {error && (
              <div className="animate-rapi-fade-up rounded-rapi-md bg-rapi-expense-soft px-3.5 py-2.5 text-[13px] font-medium text-rapi-expense">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <form
            className="sticky bottom-24 mt-3 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya soal keuanganmu…"
              aria-label="Pesan untuk Rapi AI"
              className="min-h-11 w-full rounded-full border border-white/60 bg-white/80 px-4 text-sm outline-none backdrop-blur-xl transition-colors focus:border-rapi-blue"
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || loading}
              whileTap={{ scale: 0.88 }}
              aria-label="Kirim"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rapi-blue text-white shadow-rapi-fab transition-opacity disabled:opacity-40"
            >
              <ArrowUp size={19} strokeWidth={2.5} />
            </motion.button>
          </form>
        </>
      )}
    </main>
  )
}
