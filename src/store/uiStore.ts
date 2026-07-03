import { create } from 'zustand'

interface UiState {
  toast: string | null
  showToast: (message: string) => void
  hideToast: () => void
  /** Sheet tambah transaksi (muncul dari FAB). */
  addOpen: boolean
  openAdd: () => void
  closeAdd: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  toast: null,
  showToast: (message) => set({ toast: message }),
  hideToast: () => set({ toast: null }),
  addOpen: false,
  openAdd: () => set({ addOpen: true }),
  closeAdd: () => set({ addOpen: false }),
}))
