import type { Transaction } from '@/types'

// Data dummy Fase 1 — diganti Zustand store (persist LocalStorage) di Fase 2.

export const DUMMY_USER = { name: 'Dinda' }

export const DUMMY_BALANCE = 4_280_000
export const DUMMY_INCOME = 6_200_000
export const DUMMY_EXPENSE = 1_920_000

export const DUMMY_INVESTMENT_TOTAL = 2_500_000
export const DUMMY_INVESTMENT_GROWTH = 4.2 // persen

export const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'expense',
    amount: 25_000,
    category: 'makanan',
    note: 'Makan Siang',
    date: '2026-07-02T12:15:00.000Z',
    inputMethod: 'text',
    aiParsed: true,
  },
  {
    id: 'tx-2',
    type: 'income',
    amount: 1_500_000,
    category: 'freelance',
    note: 'Gaji Freelance',
    date: '2026-07-02T09:00:00.000Z',
    inputMethod: 'text',
  },
  {
    id: 'tx-3',
    type: 'expense',
    amount: 47_000,
    category: 'belanja',
    note: 'Struk Indomaret',
    date: '2026-07-01T19:30:00.000Z',
    inputMethod: 'photo',
    aiParsed: true,
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 18_000,
    category: 'transportasi',
    note: 'Grab ke Kampus',
    date: '2026-07-01T07:45:00.000Z',
    inputMethod: 'voice',
    aiParsed: true,
  },
  {
    id: 'tx-5',
    type: 'expense',
    amount: 54_000,
    category: 'tagihan',
    note: 'Netflix',
    date: '2026-06-30T08:00:00.000Z',
    inputMethod: 'text',
  },
  {
    id: 'tx-6',
    type: 'expense',
    amount: 22_000,
    category: 'makanan',
    note: 'Kopi Kenangan',
    date: '2026-06-29T16:20:00.000Z',
    inputMethod: 'text',
    aiParsed: true,
  },
]
