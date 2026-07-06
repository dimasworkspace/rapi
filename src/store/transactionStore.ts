import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
    (set) => ({
      transactions: [],
      addTransaction: (tx) => {
        const id = crypto.randomUUID()
        set((s) => ({ transactions: [{ ...tx, id }, ...s.transactions] }))
        return id
      },
      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
    }),
    { name: 'rapi-transactions' },
  ),
)

/** Transaksi terurut terbaru dulu. */
export const sortByDateDesc = (txs: Transaction[]): Transaction[] =>
  [...txs].sort((a, b) => b.date.localeCompare(a.date))
