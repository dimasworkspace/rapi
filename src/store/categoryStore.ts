import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncBus } from '@/lib/syncBus'
import type { Category } from '@/types'
import { DEFAULT_CATEGORIES } from '@/types'

interface CategoryState {
  categories: Category[]
  addCategory: (cat: Omit<Category, 'id'>) => void
  updateCategory: (id: string, patch: Partial<Omit<Category, 'id'>>) => void
  removeCategory: (id: string) => void
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,
      addCategory: (cat) => {
        const full: Category = { ...cat, id: crypto.randomUUID() }
        set((s) => ({ categories: [...s.categories, full] }))
        syncBus.categorySaved?.(full)
      },
      updateCategory: (id, patch) => {
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }))
        const updated = get().categories.find((c) => c.id === id)
        if (updated) syncBus.categorySaved?.(updated)
      },
      removeCategory: (id) => {
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
        syncBus.categoryDeleted?.(id)
      },
    }),
    { name: 'rapi-categories' },
  ),
)
