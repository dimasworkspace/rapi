import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { TransactionItem } from '@/components/rapi/TransactionItem'
import { formatDayLabel } from '@/lib/formatters'
import { sortByDateDesc, useTransactionStore } from '@/store/transactionStore'
import type { Transaction } from '@/types'

export default function Transactions() {
  const navigate = useNavigate()
  const transactions = useTransactionStore((s) => s.transactions)

  const groups = useMemo(() => {
    const sorted = sortByDateDesc(transactions)
    const byDay = new Map<string, Transaction[]>()
    for (const tx of sorted) {
      const label = formatDayLabel(tx.date)
      const list = byDay.get(label) ?? []
      list.push(tx)
      byDay.set(label, list)
    }
    return [...byDay.entries()]
  }, [transactions])

  return (
    <PageWrapper>
      <TopBar title="Transaksi" showBack />

      {groups.length === 0 ? (
        <RapiCard className="mt-4 flex flex-col items-center gap-3 px-6 py-10 text-center">
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
        <div className="flex flex-col gap-5">
          {groups.map(([label, txs]) => (
            <section key={label}>
              <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-rapi-gray-600">
                {label}
              </h2>
              <div className="rapi-glass divide-y divide-rapi-gray-300/40 rounded-rapi-lg py-1">
                {txs.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} variant="row" />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
