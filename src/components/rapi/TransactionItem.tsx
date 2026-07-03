import { Icon3D } from '@/components/rapi/Icon3D'
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
  /** 'card' berdiri sendiri; 'row' untuk di dalam container ber-divider. */
  variant?: 'card' | 'row'
}

export function TransactionItem({ transaction: tx, variant = 'card' }: TransactionItemProps) {
  const category = DEFAULT_CATEGORIES.find((c) => c.id === tx.category)
  const isIncome = tx.type === 'income'

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        variant === 'card'
          ? 'rapi-glass rounded-rapi-lg p-3.5 transition-all hover:shadow-rapi-elevated'
          : 'px-4 py-3 transition-colors hover:bg-white/50',
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center">
        <Icon3D name={tx.category} size={30} fallback={category?.emoji ?? '💸'} />
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
