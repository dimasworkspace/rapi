// ===== Transaksi =====

export type TransactionType = 'income' | 'expense' | 'transfer'
export type InputMethod = 'text' | 'voice' | 'photo'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  note: string
  date: string // ISO string
  inputMethod: InputMethod
  receiptPhoto?: string // base64 or URL
  aiParsed?: boolean
}

// ===== Kategori =====

export interface Category {
  id: string
  name: string
  emoji: string
  type: 'income' | 'expense'
}

/** 12 kategori default — user bisa tambah/edit lewat Settings. */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'makanan', name: 'Makanan', emoji: '🍜', type: 'expense' },
  { id: 'transportasi', name: 'Transportasi', emoji: '🚗', type: 'expense' },
  { id: 'belanja', name: 'Belanja', emoji: '🛍️', type: 'expense' },
  { id: 'hiburan', name: 'Hiburan', emoji: '🎮', type: 'expense' },
  { id: 'tagihan', name: 'Tagihan', emoji: '📡', type: 'expense' },
  { id: 'kesehatan', name: 'Kesehatan', emoji: '💊', type: 'expense' },
  { id: 'pendidikan', name: 'Pendidikan', emoji: '📚', type: 'expense' },
  { id: 'lainnya-keluar', name: 'Lainnya', emoji: '🎁', type: 'expense' },
  { id: 'gaji', name: 'Gaji', emoji: '💼', type: 'income' },
  { id: 'freelance', name: 'Freelance', emoji: '💻', type: 'income' },
  { id: 'bonus', name: 'Bonus', emoji: '🎉', type: 'income' },
  { id: 'lainnya-masuk', name: 'Lainnya', emoji: '💰', type: 'income' },
]

// ===== Profil User (onboarding tanpa login) =====

export interface UserProfile {
  name: string
  initialBalance: number // saldo awal opsional saat onboarding, default 0
  createdAt: string // ISO string
}

// ===== Investasi =====

export type AssetType = 'saham' | 'reksadana' | 'kripto' | 'emas' | 'deposito'

export interface InvestmentAsset {
  id: string
  type: AssetType
  name: string
  units: number
  buyPrice: number // harga beli per unit
  currentPrice: number // harga sekarang per unit
  updatedAt: string // ISO string
}

export interface AssetTypeMeta {
  id: AssetType
  label: string
  emoji: string
}

export const ASSET_TYPES: AssetTypeMeta[] = [
  { id: 'saham', label: 'Saham', emoji: '📈' },
  { id: 'reksadana', label: 'Reksa Dana', emoji: '🏦' },
  { id: 'kripto', label: 'Kripto', emoji: '🪙' },
  { id: 'emas', label: 'Emas', emoji: '💎' },
  { id: 'deposito', label: 'Deposito', emoji: '💸' },
]
