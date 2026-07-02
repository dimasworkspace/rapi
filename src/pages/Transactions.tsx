import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { TransactionItem } from '@/components/rapi/TransactionItem'
import { DUMMY_TRANSACTIONS } from '@/lib/dummy'

export default function Transactions() {
  return (
    <PageWrapper>
      <TopBar title="Transaksi" showBack />
      <div className="flex flex-col gap-2.5">
        {DUMMY_TRANSACTIONS.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </div>
    </PageWrapper>
  )
}
