import { useEffect, useMemo, useState } from 'react'
import { Camera, Keyboard, Mic, X } from 'lucide-react'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { formatRupiah } from '@/lib/formatters'
import { parseTransaction } from '@/lib/parser'
import { cn } from '@/lib/utils'
import { useCategoryStore } from '@/store/categoryStore'
import { useTransactionStore } from '@/store/transactionStore'
import { useUiStore } from '@/store/uiStore'
import type { TransactionType } from '@/types'

const MODES = [
  { id: 'text', label: 'Teks', icon: Keyboard, ready: true },
  { id: 'voice', label: 'Suara', icon: Mic, ready: false },
  { id: 'photo', label: 'Foto', icon: Camera, ready: false },
] as const

/** Form isi transaksi — dipakai di dalam sheet. State fresh tiap sheet dibuka. */
function AddTransactionForm() {
  const categories = useCategoryStore((s) => s.categories)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const showToast = useUiStore((s) => s.showToast)
  const closeAdd = useUiStore((s) => s.closeAdd)

  const [input, setInput] = useState('')
  const [manualType, setManualType] = useState<TransactionType | null>(null)
  const [manualCategory, setManualCategory] = useState<string | null>(null)
  const [manualAmount, setManualAmount] = useState<string | null>(null)

  const parsed = useMemo(() => parseTransaction(input), [input])

  const type: TransactionType = manualType ?? parsed.type
  const category =
    manualCategory ?? (categories.some((c) => c.id === parsed.category) ? parsed.category : '')
  const amountDigits = manualAmount ?? (parsed.amount !== null ? String(parsed.amount) : '')
  const amount = amountDigits ? parseInt(amountDigits, 10) : 0

  const typeCategories = categories.filter((c) =>
    type === 'income' ? c.type === 'income' : c.type === 'expense',
  )
  const activeCategory = typeCategories.some((c) => c.id === category)
    ? category
    : (typeCategories[0]?.id ?? '')

  const canSave = amount > 0 && activeCategory !== ''

  const handleSave = () => {
    if (!canSave) return
    addTransaction({
      type,
      amount,
      category: activeCategory,
      note: parsed.note,
      date: new Date().toISOString(),
      inputMethod: 'text',
      aiParsed: false,
    })
    showToast('Kecatat! Keuanganmu makin rapi 💪')
    closeAdd()
  }

  return (
    <>
      {/* ===== HERO: mode input + tulis transaksi ===== */}
      <div className="rounded-rapi-lg border border-white/70 bg-white/70 p-3.5 shadow-rapi-card backdrop-blur-md">
        <div className="grid grid-cols-3 gap-2">
          {MODES.map(({ id, label, icon: Icon, ready }) => (
            <button
              key={id}
              type="button"
              disabled={!ready}
              className={cn(
                'flex min-h-10 items-center justify-center gap-1.5 rounded-rapi-md text-xs font-bold transition-colors',
                ready
                  ? 'bg-rapi-blue text-white shadow-rapi-card'
                  : 'border border-dashed border-rapi-blue/30 text-rapi-gray-600',
              )}
            >
              <Icon size={15} />
              {label}
              {!ready && <span className="text-[9px] font-normal opacity-70">nyusul</span>}
            </button>
          ))}
        </div>

        <label htmlFor="tx-input" className="sr-only">
          Tulis transaksi
        </label>
        <textarea
          id="tx-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={'Tulis santai aja, contoh:\n"makan siang 25rb" · "gaji 3jt" · "grab 18rb"'}
          rows={3}
          autoFocus
          className="mt-3 w-full resize-none rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/80 px-3.5 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-rapi-blue"
        />

        {input.trim() && (
          <div
            className={cn(
              'mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold',
              parsed.confidence === 'high' && 'bg-rapi-income-soft text-rapi-income',
              parsed.confidence === 'medium' && 'bg-rapi-warning-soft text-[#946800]',
              parsed.confidence === 'low' && 'bg-rapi-gray-100 text-rapi-gray-600',
            )}
          >
            {parsed.confidence === 'high' && 'Rapi ngerti! ✨'}
            {parsed.confidence === 'medium' && 'Cek kategorinya ya 👀'}
            {parsed.confidence === 'low' && 'Lengkapi nominalnya ya'}
          </div>
        )}
      </div>

      {/* ===== Detail: jenis, nominal, kategori ===== */}
      <div className="mt-4 flex gap-2">
        {(
          [
            { id: 'expense', label: '↓ Pengeluaran' },
            { id: 'income', label: '↑ Pemasukan' },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setManualType(id)
              setManualCategory(null)
            }}
            className={cn(
              'min-h-10 flex-1 rounded-rapi-md text-xs font-bold transition-colors',
              type === id
                ? id === 'expense'
                  ? 'bg-rapi-expense-soft text-rapi-expense'
                  : 'bg-rapi-income-soft text-rapi-income'
                : 'bg-white/60 text-rapi-gray-600',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <label htmlFor="tx-amount" className="mb-1.5 mt-4 block text-xs font-bold text-rapi-gray-600">
        Nominal
      </label>
      <div className="flex items-center rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 transition-colors focus-within:border-rapi-blue">
        <span className="pl-4 text-sm font-bold text-rapi-gray-600">Rp</span>
        <input
          id="tx-amount"
          value={amount ? new Intl.NumberFormat('id-ID').format(amount) : ''}
          onChange={(e) => setManualAmount(e.target.value.replace(/\D/g, ''))}
          placeholder="0"
          inputMode="numeric"
          className="w-full bg-transparent px-2 py-3 text-sm font-bold outline-none"
        />
      </div>

      <p className="mb-1.5 mt-4 text-xs font-bold text-rapi-gray-600">Kategori</p>
      <div className="grid grid-cols-4 gap-2">
        {typeCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setManualCategory(cat.id)}
            className={cn(
              'flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-rapi-md p-1.5 text-[10px] font-bold transition-colors',
              activeCategory === cat.id
                ? 'bg-rapi-blue text-white shadow-rapi-card'
                : 'border border-white/70 bg-white/55 text-rapi-gray-600',
            )}
          >
            <Icon3D name={cat.id} size={22} fallback={cat.emoji} />
            <span className="w-full truncate text-center leading-tight">{cat.name}</span>
          </button>
        ))}
      </div>

      <RapiButton
        variant="blue"
        onClick={handleSave}
        disabled={!canSave}
        className="mt-5 w-full text-base"
      >
        {canSave ? `Simpan ${formatRupiah(amount)} ✅` : 'Simpan Transaksi'}
      </RapiButton>
    </>
  )
}

/** Bottom sheet setengah layar yang meluncur dari FAB. */
export function AddTransactionSheet() {
  const open = useUiStore((s) => s.addOpen)
  const closeAdd = useUiStore((s) => s.closeAdd)

  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAdd()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeAdd])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup"
        onClick={closeAdd}
        className="absolute inset-0 animate-rapi-fade-in bg-rapi-navy/40 backdrop-blur-[2px]"
      />

      {/* Sheet — biru glass premium, meluncur dari bawah (FAB) */}
      <div className="absolute bottom-0 left-1/2 flex max-h-[88vh] w-full max-w-md -translate-x-1/2 animate-rapi-sheet-up flex-col overflow-hidden rounded-t-rapi-xl border-t border-white/40 bg-gradient-to-b from-[#E8F0FF]/95 to-[#F8FAFF]/95 backdrop-blur-2xl">
        {/* Ambient biru biar glass-nya hidup */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 right-0 h-40 w-40 rounded-full bg-rapi-blue/15 blur-3xl"
        />

        <div className="relative flex items-center justify-between px-5 pt-4">
          <div className="mx-auto absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-rapi-navy/15" />
          <h2 className="text-base font-bold text-rapi-navy">Tambah Transaksi</h2>
          <button
            type="button"
            onClick={closeAdd}
            aria-label="Tutup"
            className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full text-rapi-gray-600 transition-colors hover:bg-white/60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3">
          <AddTransactionForm />
        </div>
      </div>
    </div>
  )
}
