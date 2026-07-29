import { create } from 'zustand'

interface ToastData {
  message: string
  /** Kalau ada, toast nampilin tombol "Urungkan" (aturan undo-support). */
  onUndo?: () => void
}

interface ConfirmData {
  message: string
  /** Label tombol aksi (mis. "Hapus", "Reset"). */
  confirmLabel: string
  /** Aksi destruktif → tombol merah. */
  danger?: boolean
  onConfirm: () => void
}

interface UiState {
  toast: ToastData | null
  showToast: (message: string, onUndo?: () => void) => void
  hideToast: () => void
  /** Dialog konfirmasi on-brand (ganti confirm() native). */
  confirm: ConfirmData | null
  showConfirm: (data: ConfirmData) => void
  hideConfirm: () => void
  /** Sheet tambah transaksi (muncul dari FAB). */
  addOpen: boolean
  openAdd: () => void
  closeAdd: () => void
  /** Foto struk yang dikirim dari app lain (share sheet HP) — dipungut sekali
   *  oleh form tambah transaksi, lalu langsung dibersihkan. */
  pendingPhoto: File | null
  openAddWithPhoto: (file: File) => void
  clearPendingPhoto: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  toast: null,
  showToast: (message, onUndo) => set({ toast: { message, onUndo } }),
  hideToast: () => set({ toast: null }),
  confirm: null,
  showConfirm: (data) => set({ confirm: data }),
  hideConfirm: () => set({ confirm: null }),
  addOpen: false,
  openAdd: () => set({ addOpen: true }),
  closeAdd: () => set({ addOpen: false, pendingPhoto: null }),
  pendingPhoto: null,
  openAddWithPhoto: (file) => set({ addOpen: true, pendingPhoto: file }),
  clearPendingPhoto: () => set({ pendingPhoto: null }),
}))
