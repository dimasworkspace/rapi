import { Trash2 } from 'lucide-react'
import { Icon3D } from '@/components/rapi/Icon3D'
import type { Transaction } from '@/types'
import { DEFAULT_CATEGORIES } from '@/types'
import { formatRupiahSigned } from '@/lib/formatters'
import { type Dict, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const methodLabel = (t: Dict, tx: Transaction): string => {
  if (tx.inputMethod === 'photo') return t.transactions.methodPhoto
  if (tx.inputMethod === 'voice') return t.transactions.methodVoice
  return tx.aiParsed ? t.transactions.methodAi : t.common.manual
}

interface TransactionItemProps {
  transaction: Transaction
  /** 'card' berdiri sendiri; 'row' untuk di dalam container ber-divider. */
  variant?: 'card' | 'row'
  /** Kalau diisi, muncul tombol hapus (dipasangkan dengan toast undo). */
  onDelete?: () => void
}

export function TransactionItem({
  transaction: tx,
  variant = 'card',
  onDelete,
}: TransactionItemProps) {
  const t = useT()
  const category = DEFAULT_CATEGORIES.find((c) => c.id === tx.category)
  const isIncome = tx.type === 'income'

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        variant === 'card'
          ? 'rapi-glass rounded-rapi-lg p-3.5 transition-all hover:shadow-rapi-elevated'
          : 'px-4 py-3 transition-colors hover:bg-white/50 dark:hover:bg-white/5',
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center">
        <Icon3D name={tx.category} size={30} fallback={category?.emoji ?? '💸'} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold dark:text-rapi-dark-ink">
          {tx.note || category?.name || t.transactions.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-rapi-gray-600">
          {category?.name ?? t.settings.other} · {methodLabel(t, tx)}
        </p>
      </div>
      <p
        className={cn(
          'tabular-nums whitespace-nowrap text-sm font-bold',
          isIncome ? 'text-rapi-income' : 'text-rapi-expense',
        )}
      >
        {formatRupiahSigned(tx.amount, isIncome ? 'income' : 'expense')}
      </p>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Hapus ${tx.note || 'transaksi'}`}
          className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-rapi-gray-300 transition-colors hover:bg-rapi-expense-soft hover:text-rapi-expense"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  )
}
