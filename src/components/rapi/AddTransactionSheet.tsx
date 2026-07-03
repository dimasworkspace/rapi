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

/** Form isi transaksi — state fresh tiap sheet dibuka. */
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
      <div className="grid grid-cols-3 gap-2">
        {MODES.map(({ id, label, icon: Icon, ready }) => (
          <button
            key={id}
            type="button"
            disabled={!ready}
            className={cn(
              'flex min-h-9 items-center justify-center gap-1.5 rounded-rapi-md text-xs font-bold transition-colors',
              ready
                ? 'bg-rapi-blue text-white shadow-rapi-card'
                : 'border border-dashed border-rapi-blue/30 text-rapi-gray-600',
            )}
          >
            <Icon size={14} />
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
        placeholder={'Tulis santai aja, contoh:\n"makan siang 25rb" · "gaji 3jt"'}
        rows={2}
        autoFocus
        className="mt-2.5 w-full resize-none rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-rapi-blue"
      />

      {/* ===== Auto-detect compact: jenis · nominal · kategori ===== */}
      <div className="mt-2.5 flex items-center gap-2">
        <div className="flex flex-1 rounded-rapi-md bg-white/50 p-1">
          {(
            [
              { id: 'expense', label: 'Keluar' },
              { id: 'income', label: 'Masuk' },
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
                'flex-1 rounded-[7px] py-1.5 text-xs font-bold transition-colors',
                type === id
                  ? id === 'expense'
                    ? 'bg-rapi-expense-soft text-rapi-expense'
                    : 'bg-rapi-income-soft text-rapi-income'
                  : 'text-rapi-gray-600',
              )}
            >
              {id === 'expense' ? '↓ ' : '↑ '}
              {label}
            </button>
          ))}
        </div>
        <div className="flex w-36 items-center rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/60 transition-colors focus-within:border-rapi-blue">
          <span className="pl-2.5 text-xs font-bold text-rapi-gray-600">Rp</span>
          <input
            aria-label="Nominal"
            value={amount ? new Intl.NumberFormat('id-ID').format(amount) : ''}
            onChange={(e) => setManualAmount(e.target.value.replace(/\D/g, ''))}
            placeholder="0"
            inputMode="numeric"
            className="w-full bg-transparent px-1.5 py-2 text-sm font-bold outline-none"
          />
        </div>
      </div>

      {/* Kategori — otomatis kepilih, geser buat ganti */}
      <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
        {typeCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setManualCategory(cat.id)}
            className={cn(
              'flex min-w-[62px] shrink-0 flex-col items-center gap-1 rounded-rapi-md px-2 py-2 text-[10px] font-bold transition-colors',
              activeCategory === cat.id
                ? 'bg-rapi-blue text-white shadow-rapi-card'
                : 'border border-white/60 bg-white/45 text-rapi-gray-600',
            )}
          >
            <Icon3D name={cat.id} size={20} fallback={cat.emoji} />
            <span className="w-full truncate text-center leading-tight">{cat.name}</span>
          </button>
        ))}
      </div>

      <RapiButton
        variant="blue"
        onClick={handleSave}
        disabled={!canSave}
        className="mt-3 w-full text-base"
      >
        {canSave ? `Simpan ${formatRupiah(amount)} ✅` : 'Simpan Transaksi'}
      </RapiButton>
    </>
  )
}

/** Card melayang transparan yang meluncur dari FAB. */
export function AddTransactionSheet() {
  const open = useUiStore((s) => s.addOpen)
  const closeAdd = useUiStore((s) => s.closeAdd)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAdd()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeAdd])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop tipis — layar utama tetap terlihat, sekadar meredup */}
      <button
        type="button"
        aria-label="Tutup"
        onClick={closeAdd}
        className="absolute inset-0 animate-rapi-fade-in bg-rapi-navy/20"
      />

      {/* Card melayang — biru glass transparan, meluncur dari bawah (FAB) */}
      <div className="absolute inset-x-3 bottom-3 mx-auto flex max-h-[78vh] max-w-[27rem] animate-rapi-sheet-up flex-col overflow-hidden rounded-rapi-xl border border-white/60 bg-[#EAF1FF]/55 shadow-rapi-elevated backdrop-blur-2xl">
        <div className="flex items-center justify-between px-4 pb-1 pt-3.5">
          <h2 className="text-[15px] font-bold text-rapi-navy">Tambah Transaksi</h2>
          <button
            type="button"
            onClick={closeAdd}
            aria-label="Tutup"
            className="-mr-1.5 flex h-8 w-8 items-center justify-center rounded-full text-rapi-gray-600 transition-colors hover:bg-white/60"
          >
            <X size={17} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-4 pt-1">
          <AddTransactionForm />
        </div>
      </div>
    </div>
  )
}
