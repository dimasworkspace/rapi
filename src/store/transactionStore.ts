import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncBus } from '@/lib/syncBus'
import type { Transaction } from '@/types'

interface TransactionState {
  transactions: Transaction[]
  /** Mengembalikan id transaksi baru — dipakai buat undo. */
  addTransaction: (tx: Omit<Transaction, 'id'>) => string
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, 'id'>>) => void
  removeTransaction: (id: string) => void
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      addTransaction: (tx) => {
        const id = crypto.randomUUID()
        const full: Transaction = { ...tx, id }
        set((s) => ({ transactions: [full, ...s.transactions] }))
        syncBus.transactionSaved?.(full)
        return id
      },
      updateTransaction: (id, patch) => {
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }))
        const updated = get().transactions.find((t) => t.id === id)
        if (updated) syncBus.transactionSaved?.(updated)
      },
      removeTransaction: (id) => {
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }))
        syncBus.transactionDeleted?.(id)
      },
    }),
    { name: 'rapi-transactions' },
  ),
)

/** Transaksi terurut terbaru dulu. */
export const sortByDateDesc = (txs: Transaction[]): Transaction[] =>
  [...txs].sort((a, b) => b.date.localeCompare(a.date))
