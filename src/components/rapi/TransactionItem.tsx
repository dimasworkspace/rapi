import { Trash2 } from 'lucide-react'
import { Icon3D } from '@/components/rapi/Icon3D'
import { useCategoryStore } from '@/store/categoryStore'
import type { Transaction } from '@/types'
import { formatRupiahSigned } from '@/lib/formatters'
import { type Dict, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// Input manual sengaja tanpa label: itu keadaan default, bukan kabar. Label cuma
// muncul kalau cara masukinnya memang bikin beda (suara / foto struk / AI).
const methodLabel = (t: Dict, tx: Transaction): string | null => {
  if (tx.inputMethod === 'photo') return t.transactions.methodPhoto
  if (tx.inputMethod === 'voice') return t.transactions.methodVoice
  return tx.aiParsed ? t.transactions.methodAi : null
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
  // Kategori dibaca dari store, bukan daftar default — biar kategori buatan user
  // ikut tampil dengan nama & emoji-nya sendiri.
  const categories = useCategoryStore((s) => s.categories)
  const category = categories.find((c) => c.id === tx.category)
  const isIncome = tx.type === 'income'
  const method = methodLabel(t, tx)

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        variant === 'card'
          ? 'rapi-surface rounded-rapi-lg p-3.5 transition-all hover:shadow-rapi-elevated'
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
          {category?.name ?? t.common.uncategorized}
          {method && ` · ${method}`}
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
          aria-label={`${t.common.delete} ${tx.note || t.transactions.title}`}
          className="-mr-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-rapi-gray-300 transition-colors hover:bg-rapi-expense-soft hover:text-rapi-expense"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  )
}
