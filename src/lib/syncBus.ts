import type { Category, InvestmentAsset, Transaction } from '@/types'

// Perantara store ↔ sync. Sengaja TANPA import store/supabase supaya tidak
// terjadi import melingkar: store cuma kenal bus ini, `sync.ts` yang mengisinya.
// Kalau backend mati / belum login, handler-nya kosong → store jalan lokal.

interface SyncBus {
  transactionSaved?: (tx: Transaction) => void
  transactionDeleted?: (id: string) => void
  investmentSaved?: (asset: InvestmentAsset) => void
  investmentDeleted?: (id: string) => void
  categorySaved?: (cat: Category) => void
  categoryDeleted?: (id: string) => void
  profileSaved?: (name: string, initialBalance: number) => void
}

export const syncBus: SyncBus = {}
