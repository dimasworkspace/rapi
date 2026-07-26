import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncBus } from '@/lib/syncBus'
import type { InvestmentAsset } from '@/types'

interface InvestmentState {
  assets: InvestmentAsset[]
  /** Mengembalikan id aset baru — dipakai buat undo. */
  addAsset: (asset: Omit<InvestmentAsset, 'id' | 'updatedAt'>) => string
  updateAsset: (id: string, patch: Partial<Omit<InvestmentAsset, 'id'>>) => void
  removeAsset: (id: string) => void
}

export const useInvestmentStore = create<InvestmentState>()(
  persist(
    (set, get) => ({
      assets: [],
      addAsset: (asset) => {
        const id = crypto.randomUUID()
        const full: InvestmentAsset = { ...asset, id, updatedAt: new Date().toISOString() }
        set((s) => ({ assets: [full, ...s.assets] }))
        syncBus.investmentSaved?.(full)
        return id
      },
      updateAsset: (id, patch) => {
        set((s) => ({
          assets: s.assets.map((a) =>
            a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
          ),
        }))
        const updated = get().assets.find((a) => a.id === id)
        if (updated) syncBus.investmentSaved?.(updated)
      },
      removeAsset: (id) => {
        set((s) => ({ assets: s.assets.filter((a) => a.id !== id) }))
        syncBus.investmentDeleted?.(id)
      },
    }),
    { name: 'rapi-investments' },
  ),
)

/** Ringkasan nilai & profit/loss satu aset. */
export const assetStats = (a: InvestmentAsset) => {
  const modal = a.units * a.buyPrice
  const value = a.units * a.currentPrice
  const pl = value - modal
  const plPct = modal > 0 ? (pl / modal) * 100 : 0
  return { modal, value, pl, plPct }
}
