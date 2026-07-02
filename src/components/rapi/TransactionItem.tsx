import type { Transaction } from '@/types'
import { DEFAULT_CATEGORIES } from '@/types'
import { formatRupiahSigned } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const methodLabel = (tx: Transaction): string => {
  if (tx.inputMethod === 'photo') return 'Scan Foto'
  if (tx.inputMethod === 'voice') return 'Suara'
  return tx.aiParsed ? 'via Chat AI' : 'Manual'
}

interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction: tx }: TransactionItemProps) {
  const category = DEFAULT_CATEGORIES.find((c) => c.id === tx.category)
  const isIncome = tx.type === 'income'

  return (
    <div className="flex items-center gap-3 rounded-rapi-lg bg-white p-3.5 shadow-rapi-card transition-all hover:shadow-rapi-elevated">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-rapi-md text-base',
          isIncome ? 'bg-rapi-income-soft' : 'bg-rapi-expense-soft',
          tx.type === 'transfer' && 'bg-rapi-savings-soft',
        )}
      >
        {category?.emoji ?? '💸'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{tx.note || category?.name || 'Transaksi'}</p>
        <p className="mt-0.5 truncate text-xs text-rapi-gray-600">
          {category?.name ?? 'Lainnya'} · {methodLabel(tx)}
        </p>
      </div>
      <p
        className={cn(
          'whitespace-nowrap text-sm font-bold',
          isIncome ? 'text-rapi-income' : 'text-rapi-expense',
        )}
      >
        {formatRupiahSigned(tx.amount, isIncome ? 'income' : 'expense')}
      </p>
    </div>
  )
}
