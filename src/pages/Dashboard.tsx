import { useMemo } from 'react'
import { isToday } from 'date-fns'
import { ArrowDown, ArrowUp, Camera, ChevronRight, Mic, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { TransactionItem } from '@/components/rapi/TransactionItem'
import { formatRupiah } from '@/lib/formatters'
import { useCountUp } from '@/lib/useCountUp'
import { sortByDateDesc, useTransactionStore } from '@/store/transactionStore'
import { useUserStore } from '@/store/userStore'

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi 👋'
  if (h < 15) return 'Selamat siang ☀️'
  if (h < 18) return 'Selamat sore 🌤️'
  return 'Selamat malam 🌙'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const profile = useUserStore((s) => s.profile)
  const transactions = useTransactionStore((s) => s.transactions)

  const { balance, monthIncome, monthExpense, recent, todayCount } = useMemo(() => {
    const initial = profile?.initialBalance ?? 0
    const now = new Date()
    let income = 0
    let expense = 0
    let inMonth = 0
    let outMonth = 0
    let today = 0

    for (const tx of transactions) {
      if (tx.type === 'income') income += tx.amount
      if (tx.type === 'expense') expense += tx.amount
      const d = new Date(tx.date)
      const sameMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      if (sameMonth && tx.type === 'income') inMonth += tx.amount
      if (sameMonth && tx.type === 'expense') outMonth += tx.amount
      if (isToday(d)) today += 1
    }

    return {
      balance: initial + income - expense,
      monthIncome: inMonth,
      monthExpense: outMonth,
      recent: sortByDateDesc(transactions).slice(0, 5),
      todayCount: today,
    }
  }, [transactions, profile])

  const animatedBalance = useCountUp(balance)
  const name = profile?.name ?? 'Kamu'

  return (
    <PageWrapper className="px-0">
      {/* ===== Navy canvas — zona hero terintegrasi ===== */}
      <header className="relative overflow-hidden rounded-b-[28px] bg-gradient-to-br from-rapi-navy via-rapi-navy to-[#1E2A55] px-5 pb-14 pt-7 text-white">
        <div
          aria-hidden
          className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-rapi-yellow/25 blur-2xl"
        />
        <div aria-hidden className="absolute -right-4 top-16 h-3 w-3 rounded-full bg-rapi-yellow/70" />
        <div aria-hidden className="absolute right-14 top-8 h-2 w-2 rounded-full bg-rapi-yellow/50" />
        <div
          aria-hidden
          className="absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-rapi-blue/40 blur-2xl"
        />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60">{getGreeting()}</p>
            <p className="mt-0.5 text-xl font-bold">Halo, {name}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rapi-yellow font-bold text-rapi-navy">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>

        <p className="relative mt-7 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
          Total Saldo
        </p>
        <p className="relative mt-1 text-[40px] font-bold leading-none tracking-tight">
          {formatRupiah(animatedBalance)}
        </p>

        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
            <ArrowUp size={12} className="text-emerald-300" strokeWidth={3} />
            {formatRupiah(monthIncome)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
            <ArrowDown size={12} className="text-red-300" strokeWidth={3} />
            {formatRupiah(monthExpense)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rapi-yellow px-3 py-1.5 text-xs font-bold text-rapi-navy">
            {todayCount > 0 ? `🔥 ${todayCount} kecatat hari ini` : '⚡ Gas #RapiinAja!'}
          </span>
        </div>
      </header>

      {/* ===== Quick input — mengambang menembus batas navy ===== */}
      <button
        type="button"
        onClick={() => navigate('/tambah')}
        className="relative z-10 -mt-7 mx-5 flex items-center gap-3 rounded-rapi-lg bg-white p-3.5 text-left shadow-rapi-elevated transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rapi-yellow">
          <Sparkles size={17} className="text-rapi-navy" />
        </span>
        <span className="flex-1 truncate text-sm text-rapi-gray-600">
          Ketik aja: <span className="font-bold text-rapi-navy">"makan 25rb"</span> — sisanya Rapi
          yang beresin
        </span>
        <span className="flex shrink-0 items-center gap-2 text-rapi-gray-300">
          <Mic size={16} />
          <Camera size={16} />
        </span>
      </button>

      <div className="px-5">
        {/* ===== Tile 2 kolom — mecah ritme full-width ===== */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <RapiCard
            variant="blue"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/investasi')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/investasi')}
            className="relative cursor-pointer overflow-hidden"
          >
            <div aria-hidden className="absolute -bottom-8 -right-6 h-20 w-20 rounded-full bg-white/10" />
            <span className="text-xl">📈</span>
            <p className="mt-2 text-sm font-bold">Investasi</p>
            <p className="mt-0.5 text-[11px] leading-snug text-white/70">
              Profit/loss kehitung otomatis
            </p>
          </RapiCard>
          <RapiCard
            role="button"
            tabIndex={0}
            onClick={() => navigate('/laporan')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/laporan')}
            className="cursor-pointer"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rapi-warning-soft text-lg">
              📊
            </span>
            <p className="mt-2 text-sm font-bold">Laporan</p>
            <p className="mt-0.5 text-[11px] leading-snug text-rapi-gray-600">
              Ringkasan & tren bulananmu
            </p>
          </RapiCard>
        </div>

        {/* ===== Transaksi terbaru — satu container, bukan kartu bertumpuk ===== */}
        <div className="mb-2.5 mt-7 flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-rapi-gray-600">
            Transaksi Terbaru
          </h2>
          {transactions.length > 0 && (
            <Link to="/transaksi" className="flex items-center text-xs font-bold text-rapi-blue">
              Lihat semua
              <ChevronRight size={14} />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <RapiCard className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="animate-bounce text-4xl" style={{ animationDuration: '1.8s' }}>
              🎉
            </span>
            <p className="text-sm leading-relaxed text-rapi-gray-600">
              Belum ada catatan nih. Yuk mulai #RapiinAja!
            </p>
            <RapiButton variant="accent" onClick={() => navigate('/tambah')}>
              Catat Transaksi Pertamamu ✍️
            </RapiButton>
          </RapiCard>
        ) : (
          <div className="divide-y divide-rapi-gray-100 rounded-rapi-lg bg-white py-1 shadow-rapi-card">
            {recent.map((tx, i) => (
              <div
                key={tx.id}
                className="animate-rapi-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <TransactionItem transaction={tx} variant="row" />
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
