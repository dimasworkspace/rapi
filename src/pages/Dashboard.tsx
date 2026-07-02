import { useMemo } from 'react'
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

  const { balance, monthIncome, monthExpense, recent } = useMemo(() => {
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
      const sameMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      if (sameMonth && tx.type === 'income') inMonth += tx.amount
      if (sameMonth && tx.type === 'expense') outMonth += tx.amount
    }

    return {
      balance: initial + income - expense,
      monthIncome: inMonth,
      monthExpense: outMonth,
      recent: sortByDateDesc(transactions).slice(0, 5),
    }
  }, [transactions, profile])

  return (
    <PageWrapper>
      <TopBar greetingName={profile?.name ?? 'Kamu'} />

      <BalanceWidget balance={balance} income={monthIncome} expense={monthExpense} />

      <RapiCard
        variant="blue"
        role="button"
        tabIndex={0}
        onClick={() => navigate('/investasi')}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/investasi')}
        className="mt-4 flex cursor-pointer items-center justify-between"
      >
        <div>
          <p className="text-xs text-white/75">Investasi</p>
          <p className="mt-0.5 text-sm font-bold">Catat asetmu, profit/loss otomatis 📈</p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-white/70" />
      </RapiCard>

      <div className="mb-3 mt-6 flex items-center justify-between">
        <h2 className="text-sm font-bold">Transaksi Terbaru</h2>
        {transactions.length > 0 && (
          <Link to="/transaksi" className="text-xs font-bold text-rapi-blue">
            Lihat semua
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <RapiCard className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <span className="text-4xl">🎉</span>
          <p className="text-sm leading-relaxed text-rapi-gray-600">
            Belum ada catatan nih. Yuk mulai #RapiinAja!
          </p>
          <RapiButton variant="accent" onClick={() => navigate('/tambah')}>
            Catat Transaksi Pertamamu ✍️
          </RapiButton>
        </RapiCard>
      ) : (
        <div className="flex flex-col gap-2.5">
          {recent.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
