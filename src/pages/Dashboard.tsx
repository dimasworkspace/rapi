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
import { useUiStore } from '@/store/uiStore'
import { useUserStore } from '@/store/userStore'

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi 👋'
  if (h < 15) return 'Selamat siang ☀️'
  if (h < 18) return 'Selamat sore 🌤️'
  return 'Selamat malam 🌙'
}

// Rangkuman keuangan mingguan (7 hari terakhir) — diupdate otomatis dari data.
const buildWeeklySummary = (
  name: string,
  count: number,
  income: number,
  expense: number,
): string => {
  if (count === 0) {
    return `Minggu ini belum ada catatan, ${name}. Yuk mulai catat biar keuanganmu makin rapi minggu ini.`
  }
  const base = `Minggu ini kamu catat ${count} transaksi — pemasukan ${formatRupiah(
    income,
  )}, pengeluaran ${formatRupiah(expense)}.`
  if (income >= expense && income > 0) {
    return `Bagus, ${name}! ${base} Pemasukanmu masih lebih gede, pertahankan ya.`
  }
  if (expense > income && income > 0) {
    return `${base} Pengeluaran lagi lebih tinggi dari pemasukan, coba lebih hemat minggu depan ya, ${name}.`
  }
  return `${base} Tetap semangat catat tiap hari ya, ${name}.`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const openAdd = useUiStore((s) => s.openAdd)
  const profile = useUserStore((s) => s.profile)
  const transactions = useTransactionStore((s) => s.transactions)
  const name = profile?.name ?? 'Kamu'

  const { balance, monthIncome, monthExpense, recent, todayCount, weeklySummary } = useMemo(() => {
    const initial = profile?.initialBalance ?? 0
    const now = new Date()
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000
    let income = 0
    let expense = 0
    let inMonth = 0
    let outMonth = 0
    let today = 0
    let weekCount = 0
    let weekIncome = 0
    let weekExpense = 0

    for (const tx of transactions) {
      if (tx.type === 'income') income += tx.amount
      if (tx.type === 'expense') expense += tx.amount
      const d = new Date(tx.date)
      const sameMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      if (sameMonth && tx.type === 'income') inMonth += tx.amount
      if (sameMonth && tx.type === 'expense') outMonth += tx.amount
      if (isToday(d)) today += 1
      if (d.getTime() >= weekAgo) {
        weekCount += 1
        if (tx.type === 'income') weekIncome += tx.amount
        if (tx.type === 'expense') weekExpense += tx.amount
      }
    }

    return {
      balance: initial + income - expense,
      monthIncome: inMonth,
      monthExpense: outMonth,
      recent: sortByDateDesc(transactions).slice(0, 5),
      todayCount: today,
      weeklySummary: buildWeeklySummary(name, weekCount, weekIncome, weekExpense),
    }
  }, [transactions, profile, name])

  const animatedBalance = useCountUp(balance)

  return (
    <PageWrapper className="px-0" animate={false}>
      {/* ===== Navy canvas hero — navy diam nutup atas, konten yang turun ===== */}
      <header className="relative overflow-hidden rounded-b-[28px] bg-gradient-to-br from-rapi-navy via-[#17265e] to-[#0a3db2] px-5 pb-7 pt-8 text-white">
        <div
          aria-hidden
          className="absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-rapi-blue/40 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-rapi-yellow/20 blur-2xl"
        />

        <div className="relative animate-rapi-slide-down text-center">
          <p className="text-xs text-white/60">{getGreeting()}</p>
          <p className="mt-1 text-xl font-bold">Halo, {name}</p>

          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
            Total Saldo
          </p>
          <p className="mt-1.5 text-[40px] font-bold leading-none tracking-tight">
            {formatRupiah(animatedBalance)}
          </p>

          {/* 3 card stat glass — semua bisa diklik */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <button
              type="button"
              onClick={() => navigate('/laporan?tipe=pemasukan')}
              className="flex flex-col items-center rounded-rapi-md border border-emerald-300/25 bg-emerald-400/10 p-2.5 backdrop-blur-sm transition-colors hover:bg-emerald-400/20"
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
              className="flex flex-col items-center justify-center rounded-rapi-md border border-white/25 bg-white/15 px-2 py-2 backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <p className="text-lg font-bold leading-none">{todayCount}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-white/70">
                Hari Ini
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate('/laporan?tipe=pengeluaran')}
              className="flex flex-col items-center rounded-rapi-md border border-red-300/25 bg-red-400/10 p-2.5 backdrop-blur-sm transition-colors hover:bg-red-400/20"
            >
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-red-200/80">
                <ArrowDown size={11} strokeWidth={3} className="text-red-300" />
                Keluar
              </p>
              <p className="mt-1 text-xs font-bold text-white">{formatRupiah(monthExpense)}</p>
            </button>
          </div>
        </div>
      </header>

      <div className="px-5">
        {/* Rangkuman keuangan mingguan — biru (senada button & FAB), diupdate otomatis */}
        <button
          type="button"
          onClick={() => navigate('/laporan')}
          className="mt-5 w-full rounded-rapi-lg bg-gradient-to-br from-rapi-blue to-[#0334A0] p-4 text-left shadow-rapi-card transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <p className="text-[15px] font-semibold leading-snug text-white">{weeklySummary}</p>
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
            <RapiButton variant="accent" onClick={openAdd}>
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
