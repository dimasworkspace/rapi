import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction } from '@/types'

interface TransactionState {
  transactions: Transaction[]
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, 'id'>>) => void
  removeTransaction: (id: string) => void
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (tx) =>
        set((s) => ({
          transactions: [{ ...tx, id: crypto.randomUUID() }, ...s.transactions],
        })),
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
