import { useMemo } from 'react'
import { isToday } from 'date-fns'
import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Icon3D } from '@/components/rapi/Icon3D'
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
      {/* ===== Navy canvas hero — gradient biru lebih terasa, turun dari atas ===== */}
      <header className="relative animate-rapi-slide-down overflow-hidden rounded-b-[28px] bg-gradient-to-br from-rapi-navy via-[#17265e] to-[#0a3db2] px-5 pb-6 pt-8 text-white">
        <div
          aria-hidden
          className="absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-rapi-blue/40 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-rapi-yellow/20 blur-2xl"
        />
        <div aria-hidden className="absolute -right-4 top-16 h-3 w-3 rounded-full bg-rapi-yellow/70" />
        <div aria-hidden className="absolute right-14 top-8 h-2 w-2 rounded-full bg-rapi-yellow/50" />

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

        {/* 3 card stat — semua bisa diklik. Pemasukan hijau · streak putih · Pengeluaran merah */}
        <div className="relative mt-5 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => navigate('/laporan?tipe=pemasukan')}
            className="rounded-rapi-md border border-emerald-300/25 bg-emerald-400/10 p-2.5 text-left backdrop-blur-sm transition-colors hover:bg-emerald-400/20"
          >
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200/80">
              <ArrowUp size={11} strokeWidth={3} className="text-emerald-300" />
              Masuk
            </p>
            <p className="mt-1 text-xs font-bold text-white">{formatRupiah(monthIncome)}</p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/transaksi')}
            className="flex flex-col items-center justify-center rounded-rapi-md bg-white px-2 py-2 text-center text-rapi-navy transition-transform hover:-translate-y-0.5"
          >
            <Icon3D name={todayCount > 0 ? 'fire' : 'zap'} size={20} fallback={todayCount > 0 ? '🔥' : '⚡'} />
            <p className="mt-0.5 text-sm font-bold leading-none">{todayCount}</p>
            <p className="text-[9px] font-bold text-rapi-gray-600">hari ini</p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/laporan?tipe=pengeluaran')}
            className="rounded-rapi-md border border-red-300/25 bg-red-400/10 p-2.5 text-left backdrop-blur-sm transition-colors hover:bg-red-400/20"
          >
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-red-200/80">
              <ArrowDown size={11} strokeWidth={3} className="text-red-300" />
              Keluar
            </p>
            <p className="mt-1 text-xs font-bold text-white">{formatRupiah(monthExpense)}</p>
          </button>
        </div>
      </header>

      <div className="px-5">
        {/* Rapi AI — satu card kompak, bisa diklik */}
        <button
          type="button"
          onClick={() => navigate('/ai')}
          className="rapi-glass mt-5 flex w-full items-center gap-3 rounded-rapi-lg p-3.5 text-left transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Icon3D name="robot" size={34} fallback="🤖" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-rapi-navy">Rapi AI</span>
            <span className="block truncate text-[11px] text-rapi-gray-600">
              Tanya apa aja soal keuanganmu
            </span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-rapi-gray-300" />
        </button>

        {/* Transaksi terbaru — heading & link navy */}
        <div className="mb-2.5 mt-7 flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-rapi-navy">
            Transaksi Terbaru
          </h2>
          {transactions.length > 0 && (
            <Link to="/transaksi" className="flex items-center text-xs font-bold text-rapi-navy">
              Lihat semua
              <ChevronRight size={14} />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <RapiCard className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="animate-bounce" style={{ animationDuration: '1.8s' }}>
              <Icon3D name="party" size={52} fallback="🎉" />
            </span>
            <p className="text-sm leading-relaxed text-rapi-gray-600">
              Belum ada catatan nih. Yuk mulai #RapiinAja!
            </p>
            <RapiButton variant="accent" onClick={() => navigate('/tambah')}>
              Catat Transaksi Pertamamu ✍️
            </RapiButton>
          </RapiCard>
        ) : (
          <div className="rapi-glass divide-y divide-rapi-gray-300/40 rounded-rapi-lg py-1">
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
