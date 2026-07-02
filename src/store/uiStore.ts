import { create } from 'zustand'

interface UiState {
  toast: string | null
  showToast: (message: string) => void
  hideToast: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  toast: null,
  showToast: (message) => set({ toast: message }),
  hideToast: () => set({ toast: null }),
}))
