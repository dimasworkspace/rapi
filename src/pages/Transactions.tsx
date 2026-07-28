import { useMemo } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { RapiMascot } from '@/components/rapi/RapiMascot'
import { TransactionItem } from '@/components/rapi/TransactionItem'
import { formatDayLabel } from '@/lib/formatters'
import { useT } from '@/lib/i18n'
import { sortByDateDesc, useTransactionStore } from '@/store/transactionStore'
import { useUiStore } from '@/store/uiStore'
import type { Transaction } from '@/types'

export default function Transactions() {
  const t = useT()
  const openAdd = useUiStore((s) => s.openAdd)
  const showToast = useUiStore((s) => s.showToast)
  const transactions = useTransactionStore((s) => s.transactions)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const removeTransaction = useTransactionStore((s) => s.removeTransaction)

  // Hapus langsung + tawarkan undo — lebih ramah daripada dialog konfirmasi
  const handleDelete = (tx: Transaction) => {
    removeTransaction(tx.id)
    const { id: _id, ...rest } = tx
    showToast(t.transactions.deleted, () => addTransaction(rest))
  }

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
      <TopBar title={t.transactions.title} showBack />

      {groups.length === 0 ? (
        <RapiCard className="mt-4 flex flex-col items-center gap-3 px-6 py-10 text-center">
          <RapiMascot size={110} />
          <p className="text-sm leading-relaxed text-rapi-gray-600">{t.transactions.empty}</p>
          <RapiButton variant="accent" onClick={openAdd}>
            {t.transactions.emptyCta}
          </RapiButton>
        </RapiCard>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map(([label, txs], gi) => (
            <section
              key={label}
              className="animate-rapi-fade-up"
              style={{ animationDelay: `${Math.min(gi, 6) * 60}ms` }}
            >
              <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-rapi-gray-600">
                {label}
              </h2>
              <div className="rapi-surface divide-y divide-rapi-gray-300/40 rounded-rapi-lg py-1">
                {txs.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    variant="row"
                    onDelete={() => handleDelete(tx)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
