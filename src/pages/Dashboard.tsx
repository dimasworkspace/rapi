import { useMemo } from 'react'
import { isToday } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { BalanceWidget } from '@/components/rapi/BalanceWidget'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { TransactionItem } from '@/components/rapi/TransactionItem'
import { sortByDateDesc, useTransactionStore } from '@/store/transactionStore'
import { useUserStore } from '@/store/userStore'

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

  return (
    <PageWrapper>
      <TopBar greetingName={profile?.name ?? 'Kamu'} />

      <BalanceWidget balance={balance} income={monthIncome} expense={monthExpense} />

      {/* Insight strip Sunshine Yellow — momen energi harian */}
      <div className="mt-4 flex items-center gap-3 rounded-rapi-lg bg-rapi-yellow px-4 py-3 shadow-rapi-card">
        <span className="text-xl">{todayCount > 0 ? '🔥' : '⚡'}</span>
        <p className="text-[13px] font-bold leading-snug text-rapi-navy">
          {todayCount > 0
            ? `${todayCount} transaksi kecatat hari ini — rapi banget!`
            : 'Belum ada catatan hari ini — gas #RapiinAja!'}
        </p>
      </div>

      <RapiCard
        variant="blue"
        role="button"
        tabIndex={0}
        onClick={() => navigate('/investasi')}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/investasi')}
        className="relative mt-4 flex cursor-pointer items-center justify-between overflow-hidden"
      >
        <div aria-hidden className="absolute -bottom-10 -right-6 h-24 w-24 rounded-full bg-white/10" />
        <div>
          <p className="text-xs text-white/75">Investasi</p>
          <p className="mt-0.5 text-sm font-bold">Catat asetmu, profit/loss otomatis 📈</p>
        </div>
        <ChevronRight size={18} className="relative shrink-0 text-white/70" />
      </RapiCard>

      <div className="mb-3 mt-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <span aria-hidden className="inline-block h-3.5 w-1.5 rounded-full bg-rapi-yellow" />
          Transaksi Terbaru
        </h2>
        {transactions.length > 0 && (
          <Link to="/transaksi" className="text-xs font-bold text-rapi-blue">
            Lihat semua
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
        <div className="flex flex-col gap-2.5">
          {recent.map((tx, i) => (
            <div
              key={tx.id}
              className="animate-rapi-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <TransactionItem transaction={tx} />
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
