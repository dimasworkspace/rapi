import { create } from 'zustand'

interface ToastData {
  message: string
  /** Kalau ada, toast nampilin tombol "Urungkan" (aturan undo-support). */
  onUndo?: () => void
}

interface UiState {
  toast: ToastData | null
  showToast: (message: string, onUndo?: () => void) => void
  hideToast: () => void
  /** Sheet tambah transaksi (muncul dari FAB). */
  addOpen: boolean
  openAdd: () => void
  closeAdd: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  toast: null,
  showToast: (message, onUndo) => set({ toast: { message, onUndo } }),
  hideToast: () => set({ toast: null }),
  addOpen: false,
  openAdd: () => set({ addOpen: true }),
  closeAdd: () => set({ addOpen: false }),
}))
