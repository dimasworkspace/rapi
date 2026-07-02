import { ChevronRight, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { BalanceWidget } from '@/components/rapi/BalanceWidget'
import { RapiCard } from '@/components/rapi/RapiCard'
import { TransactionItem } from '@/components/rapi/TransactionItem'
import { formatRupiah } from '@/lib/formatters'
import {
  DUMMY_BALANCE,
  DUMMY_EXPENSE,
  DUMMY_INCOME,
  DUMMY_INVESTMENT_GROWTH,
  DUMMY_INVESTMENT_TOTAL,
  DUMMY_TRANSACTIONS,
  DUMMY_USER,
} from '@/lib/dummy'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <PageWrapper>
      <TopBar greetingName={DUMMY_USER.name} />

      <BalanceWidget balance={DUMMY_BALANCE} income={DUMMY_INCOME} expense={DUMMY_EXPENSE} />

      <RapiCard
        variant="blue"
        role="button"
        tabIndex={0}
        onClick={() => navigate('/investasi')}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/investasi')}
        className="mt-4 flex cursor-pointer items-center justify-between"
      >
        <div>
          <p className="text-xs text-white/75">Total Investasi</p>
          <p className="mt-0.5 text-lg font-bold">{formatRupiah(DUMMY_INVESTMENT_TOTAL)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-emerald-300">
            <TrendingUp size={13} />+{DUMMY_INVESTMENT_GROWTH.toLocaleString('id-ID')}%
          </span>
          <ChevronRight size={18} className="text-white/70" />
        </div>
      </RapiCard>

      <div className="mb-3 mt-6 flex items-center justify-between">
        <h2 className="text-sm font-bold">Transaksi Terbaru</h2>
        <Link to="/transaksi" className="text-xs font-bold text-rapi-blue">
          Lihat semua
        </Link>
      </div>

      <div className="flex flex-col gap-2.5">
        {DUMMY_TRANSACTIONS.slice(0, 5).map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </div>
    </PageWrapper>
  )
}
