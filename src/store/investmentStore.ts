import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
    (set) => ({
      assets: [],
      addAsset: (asset) => {
        const id = crypto.randomUUID()
        set((s) => ({
          assets: [{ ...asset, id, updatedAt: new Date().toISOString() }, ...s.assets],
        }))
        return id
      },
      updateAsset: (id, patch) =>
        set((s) => ({
          assets: s.assets.map((a) =>
            a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
          ),
        })),
      removeAsset: (id) => set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),
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
