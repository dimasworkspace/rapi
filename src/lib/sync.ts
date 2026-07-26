import { requireSupabase, supabase } from '@/lib/supabase'
import { syncBus } from '@/lib/syncBus'
import { useAuthStore } from '@/store/authStore'
import { useCategoryStore } from '@/store/categoryStore'
import { useInvestmentStore } from '@/store/investmentStore'
import { useTransactionStore } from '@/store/transactionStore'
import { useUserStore } from '@/store/userStore'
import type { AssetType, Category, InvestmentAsset, Transaction, TransactionType } from '@/types'

// Jembatan Zustand ↔ Supabase.
//
// Pola: tulisan bersifat OPTIMISTIC — state lokal diubah dulu biar UI instan,
// lalu didorong ke server di belakang layar. Kalau gagal, onSyncError dipanggil
// supaya UI bisa kasih tahu user (jangan diam-diam hilang).

/** Dipasang sekali dari App — biasanya menampilkan toast error. */
let onSyncError: ((message: string) => void) | null = null
export const setSyncErrorHandler = (fn: (message: string) => void) => {
  onSyncError = fn
}

const uid = (): string | null => useAuthStore.getState().user?.id ?? null

/** Backend hidup DAN user sudah login? Kalau tidak, lewati sync (mode lokal). */
export const syncActive = (): boolean => Boolean(supabase) && uid() !== null

/** Jalankan operasi tulis; error dilaporkan, tidak dilempar (biar UI nggak crash). */
async function push(label: string, fn: () => PromiseLike<{ error: unknown }>): Promise<void> {
  if (!syncActive()) return
  try {
    const { error } = await fn()
    if (error) throw error
  } catch (e) {
    console.error(`[sync] gagal ${label}:`, e)
    onSyncError?.(label)
  }
}

// ---------- Pemetaan baris DB ↔ tipe app ----------

interface TxRow {
  id: string
  type: string
  amount: number
  category: string
  note: string
  date: string
  input_method: string
  ai_parsed: boolean
}
const rowToTx = (r: TxRow): Transaction => ({
  id: r.id,
  type: r.type as TransactionType,
  amount: Number(r.amount),
  category: r.category,
  note: r.note ?? '',
  date: r.date,
  inputMethod: r.input_method as Transaction['inputMethod'],
  aiParsed: r.ai_parsed,
})
const txToRow = (t: Transaction, userId: string) => ({
  id: t.id,
  user_id: userId,
  type: t.type,
  amount: t.amount,
  category: t.category,
  note: t.note ?? '',
  date: t.date,
  input_method: t.inputMethod,
  ai_parsed: t.aiParsed ?? false,
})

interface InvRow {
  id: string
  type: string
  name: string
  units: number
  buy_price: number
  current_price: number
  updated_at: string
}
const rowToInv = (r: InvRow): InvestmentAsset => ({
  id: r.id,
  type: r.type as AssetType,
  name: r.name,
  units: Number(r.units),
  buyPrice: Number(r.buy_price),
  currentPrice: Number(r.current_price),
  updatedAt: r.updated_at,
})
const invToRow = (a: InvestmentAsset, userId: string) => ({
  id: a.id,
  user_id: userId,
  type: a.type,
  name: a.name,
  units: a.units,
  buy_price: a.buyPrice,
  current_price: a.currentPrice,
  updated_at: a.updatedAt,
})

interface CatRow {
  id: string
  name: string
  emoji: string
  type: string
}
const rowToCat = (r: CatRow): Category => ({
  id: r.id,
  name: r.name,
  emoji: r.emoji,
  type: r.type as Category['type'],
})
const catToRow = (c: Category, userId: string) => ({
  id: c.id,
  user_id: userId,
  name: c.name,
  emoji: c.emoji,
  type: c.type,
})

// ---------- TARIK: server → lokal (dipanggil sekali setelah login) ----------

export async function pullAll(): Promise<void> {
  const userId = uid()
  if (!supabase || !userId) return
  const db = requireSupabase()

  const [profile, txs, invs, cats] = await Promise.all([
    db.from('profiles').select('name, initial_balance, created_at').eq('id', userId).maybeSingle(),
    db.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
    db.from('investments').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    db.from('categories').select('*').eq('user_id', userId),
  ])

  if (profile.data) {
    useUserStore.setState({
      profile: {
        name: profile.data.name ?? '',
        initialBalance: Number(profile.data.initial_balance ?? 0),
        createdAt: profile.data.created_at ?? new Date().toISOString(),
      },
      // Onboarding dianggap selesai kalau nama sudah terisi
      onboarded: Boolean((profile.data.name ?? '').trim()),
    })
  }
  if (txs.data) useTransactionStore.setState({ transactions: txs.data.map(rowToTx) })
  if (invs.data) useInvestmentStore.setState({ assets: invs.data.map(rowToInv) })
  // Kategori kosong = akun baru; biarkan default bawaan app yang dipakai
  if (cats.data && cats.data.length > 0) {
    useCategoryStore.setState({ categories: cats.data.map(rowToCat) })
  }
}

// ---------- DORONG: lokal → server (dipanggil dari action store) ----------

export const pushTransaction = (t: Transaction) => {
  const userId = uid()
  if (!userId) return
  void push('simpan transaksi', () => requireSupabase().from('transactions').upsert(txToRow(t, userId)))
}

export const deleteTransaction = (id: string) =>
  void push('hapus transaksi', () => requireSupabase().from('transactions').delete().eq('id', id))

export const pushInvestment = (a: InvestmentAsset) => {
  const userId = uid()
  if (!userId) return
  void push('simpan aset', () => requireSupabase().from('investments').upsert(invToRow(a, userId)))
}

export const deleteInvestment = (id: string) =>
  void push('hapus aset', () => requireSupabase().from('investments').delete().eq('id', id))

export const pushCategory = (c: Category) => {
  const userId = uid()
  if (!userId) return
  void push('simpan kategori', () => requireSupabase().from('categories').upsert(catToRow(c, userId)))
}

export const deleteCategory = (id: string) => {
  const userId = uid()
  if (!userId) return
  void push('hapus kategori', () =>
    requireSupabase().from('categories').delete().eq('id', id).eq('user_id', userId),
  )
}

export const pushProfile = (name: string, initialBalance: number) => {
  const userId = uid()
  if (!userId) return
  void push('simpan profil', () =>
    requireSupabase()
      .from('profiles')
      .upsert({ id: userId, name, initial_balance: initialBalance }),
  )
}

/** Sambungkan store ke server. Dipanggil sekali dari App saat startup. */
export function registerSync(): void {
  syncBus.transactionSaved = pushTransaction
  syncBus.transactionDeleted = deleteTransaction
  syncBus.investmentSaved = pushInvestment
  syncBus.investmentDeleted = deleteInvestment
  syncBus.categorySaved = pushCategory
  syncBus.categoryDeleted = deleteCategory
  syncBus.profileSaved = pushProfile
}

// ---------- Migrasi & orkestrasi saat login ----------

/** Menandai cache lokal ini milik akun siapa — cegah data user A kebawa ke user B. */
const OWNER_KEY = 'rapi-data-owner'

const localHasData = (): boolean =>
  useTransactionStore.getState().transactions.length > 0 ||
  useInvestmentStore.getState().assets.length > 0

/** Kosongkan cache lokal (dipakai saat ganti akun / setelah logout). */
export function clearLocalData(): void {
  useTransactionStore.setState({ transactions: [] })
  useInvestmentStore.setState({ assets: [] })
  useUserStore.setState({ profile: null, onboarded: false })
  localStorage.removeItem(OWNER_KEY)
}

async function serverIsEmpty(userId: string): Promise<boolean> {
  const { count } = await requireSupabase()
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  return (count ?? 0) === 0
}

export type LoginSyncResult = 'migrated' | 'pulled' | 'skipped'

/**
 * Dipanggil sekali setelah login berhasil.
 * - Cache dari akun lain → dibuang dulu biar data nggak tercampur.
 * - Ada data lokal warisan (belum pernah punya akun) + server kosong → diunggah.
 * - Selain itu → tarik dari server (server jadi sumber kebenaran).
 */
export async function syncOnLogin(): Promise<LoginSyncResult> {
  const userId = uid()
  if (!supabase || !userId) return 'skipped'

  const owner = localStorage.getItem(OWNER_KEY)
  if (owner && owner !== userId) clearLocalData()

  // Data warisan = ada di perangkat tapi belum pernah dikaitkan ke akun mana pun
  const legacyLocal = !localStorage.getItem(OWNER_KEY) && localHasData()

  let result: LoginSyncResult = 'pulled'
  if (legacyLocal && (await serverIsEmpty(userId))) {
    await pushEverythingLocal()
    result = 'migrated'
  } else {
    await pullAll()
  }

  localStorage.setItem(OWNER_KEY, userId)
  return result
}

/** Unggah semua data lokal ke akun — dipakai saat migrasi login pertama. */
export async function pushEverythingLocal(): Promise<void> {
  const userId = uid()
  if (!supabase || !userId) return
  const db = requireSupabase()

  const { profile } = useUserStore.getState()
  const { transactions } = useTransactionStore.getState()
  const { assets } = useInvestmentStore.getState()
  const { categories } = useCategoryStore.getState()

  if (profile) {
    await db
      .from('profiles')
      .upsert({ id: userId, name: profile.name, initial_balance: profile.initialBalance })
  }
  if (categories.length) {
    await db.from('categories').upsert(categories.map((c) => catToRow(c, userId)))
  }
  if (transactions.length) {
    await db.from('transactions').upsert(transactions.map((t) => txToRow(t, userId)))
  }
  if (assets.length) {
    await db.from('investments').upsert(assets.map((a) => invToRow(a, userId)))
  }
}
