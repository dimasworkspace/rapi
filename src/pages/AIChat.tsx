import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, Settings2, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiMascot } from '@/components/rapi/RapiMascot'
import { chatWithAi, RapiAiError, useAiReady } from '@/lib/ai'
import { formatRupiah } from '@/lib/formatters'
import { useT } from '@/lib/i18n'
import { SPRING_SOFT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { useAiStore } from '@/store/aiStore'
import { useCategoryStore } from '@/store/categoryStore'
import { type Lang, useSettingsStore } from '@/store/settingsStore'
import { useUiStore } from '@/store/uiStore'
import { sortByDateDesc, useTransactionStore } from '@/store/transactionStore'
import { useUserStore } from '@/store/userStore'

/** Bangun system prompt: personality Rapi AI + konteks keuangan user yang sebenarnya. */
const buildSystemPrompt = (
  lang: Lang,
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
    lang === 'en'
      ? 'IMPORTANT: Reply in English (the user set the app to English). Keep the same friendly, casual tone.'
      : 'Balas dalam Bahasa Indonesia yang santai.',
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
  const t = useT()
  const lang = useSettingsStore((s) => s.lang)
  const profile = useUserStore((s) => s.profile)
  const transactions = useTransactionStore((s) => s.transactions)
  const categories = useCategoryStore((s) => s.categories)
  const chat = useAiStore((s) => s.chat)
  const addChat = useAiStore((s) => s.addChat)
  const clearChat = useAiStore((s) => s.clearChat)
  const showConfirm = useUiStore((s) => s.showConfirm)

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const name = profile?.name ?? 'Kamu'
  // Dua jalur dianggap siap: proxy server (cukup punya akun) ATAU key sendiri.
  const ready = useAiReady()

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
        const cat = categories.find((c) => c.id === tx.category)?.name ?? tx.category
        const sign = tx.type === 'income' ? '+' : '-'
        return `- ${tx.date.slice(0, 10)} ${sign}${formatRupiah(tx.amount)} ${cat}${
          tx.note ? ` (${tx.note})` : ''
        }`
      })
    return buildSystemPrompt(lang, name, initial + income - expense, inMonth, outMonth, recentLines)
  }, [transactions, categories, profile, name, lang])

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
      setError(e instanceof RapiAiError ? e.message : t.ai.genericError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100dvh-7rem)] flex-col px-5 pb-2">
      <div className="flex items-center justify-between">
        <TopBar title={t.ai.title} />
        {chat.length > 0 && (
          <button
            type="button"
            onClick={() =>
              showConfirm({
                message: t.ai.clearConfirm,
                confirmLabel: t.common.delete,
                danger: true,
                onConfirm: clearChat,
              })
            }
            aria-label={t.common.delete}
            className="flex h-11 w-11 items-center justify-center rounded-full text-rapi-gray-600 transition-colors hover:bg-rapi-expense-soft hover:text-rapi-expense"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {!ready ? (
        /* Cuma kejadian di mode lokal (tanpa akun): arahkan pasang key sendiri */
        <div className="rapi-surface animate-rapi-fade-up mt-4 flex flex-col items-center gap-3 rounded-rapi-lg px-6 py-12 text-center">
          <RapiMascot size={120} />
          <p className="mt-1 text-sm font-bold text-rapi-navy dark:text-rapi-dark-ink">
            {t.ai.needAiTitle}
          </p>
          <p className="text-[13px] leading-relaxed text-rapi-gray-600">{t.ai.needAiDesc}</p>
          <Link to="/profil">
            <RapiButton variant="accent">
              <Settings2 size={15} />
              {t.ai.needAiCta}
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
                <p className="mt-1 text-sm font-bold text-rapi-navy dark:text-rapi-dark-ink">
                  {t.ai.helloName(name)}
                </p>
                <p className="max-w-[16rem] text-[13px] leading-relaxed text-rapi-gray-600">
                  {t.ai.intro}
                </p>
                <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                  {t.ai.suggestions.map((s, i) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      style={{ animationDelay: `${150 + i * 70}ms` }}
                      className="animate-rapi-fade-up rounded-full border border-rapi-blue/25 bg-white/70 px-3 py-1.5 text-[12px] font-semibold text-rapi-blue transition-all hover:bg-rapi-blue hover:text-white active:scale-95 dark:bg-white/5"
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
                    // rapi-selectable: jawaban AI layak disalin, jadi dikecualikan
                    // dari user-select:none global
                    'rapi-selectable max-w-[85%] whitespace-pre-wrap rounded-rapi-lg px-3.5 py-2.5 text-[13px] leading-relaxed shadow-rapi-card',
                    m.role === 'user'
                      ? 'rounded-br-md bg-gradient-to-br from-rapi-blue to-[#0334A0] text-white'
                      : 'rapi-surface rounded-bl-md text-rapi-navy dark:text-rapi-dark-ink',
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
                <div className="rapi-surface rounded-rapi-lg rounded-bl-md px-3.5 py-2.5">
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
              placeholder={t.ai.inputPlaceholder}
              aria-label={t.ai.title}
              className="min-h-11 w-full rounded-full border border-white/60 bg-white/80 px-4 text-sm outline-none backdrop-blur-xl transition-colors focus:border-rapi-blue dark:border-white/10 dark:bg-rapi-dark-surface/80 dark:text-rapi-dark-ink"
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || loading}
              whileTap={{ scale: 0.88 }}
              aria-label={t.common.save}
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
