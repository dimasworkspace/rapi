import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
    (set) => ({
      categories: DEFAULT_CATEGORIES,
      addCategory: (cat) =>
        set((s) => ({ categories: [...s.categories, { ...cat, id: crypto.randomUUID() }] })),
      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),
    }),
    { name: 'rapi-categories' },
  ),
)
