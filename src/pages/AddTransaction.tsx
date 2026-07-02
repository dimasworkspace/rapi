import { useMemo, useState } from 'react'
import { Camera, Keyboard, Mic } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { formatRupiah } from '@/lib/formatters'
import { parseTransaction } from '@/lib/parser'
import { useCategoryStore } from '@/store/categoryStore'
import { useTransactionStore } from '@/store/transactionStore'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import type { TransactionType } from '@/types'

const MODES = [
  { id: 'text', label: 'Teks', icon: Keyboard, ready: true },
  { id: 'voice', label: 'Suara', icon: Mic, ready: false },
  { id: 'photo', label: 'Foto', icon: Camera, ready: false },
] as const

export default function AddTransaction() {
  const navigate = useNavigate()
  const categories = useCategoryStore((s) => s.categories)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const showToast = useUiStore((s) => s.showToast)

  const [input, setInput] = useState('')
  // Override manual — kalau user pilih sendiri, parser nggak menimpa lagi
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
    navigate('/')
  }

  return (
    <PageWrapper>
      <TopBar title="Tambah Transaksi" showBack />

      {/* Mode input — Suara & Foto nyusul di Fase AI */}
      <div className="flex gap-2">
        {MODES.map(({ id, label, icon: Icon, ready }) => (
          <button
            key={id}
            type="button"
            disabled={!ready}
            className={cn(
              'flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-rapi-md text-xs font-bold transition-colors',
              ready
                ? 'bg-rapi-navy text-white'
                : 'border-[1.5px] border-dashed border-rapi-gray-300 text-rapi-gray-600',
            )}
          >
            <Icon size={15} />
            {label}
            {!ready && <span className="text-[9px] font-normal opacity-70">nyusul ✨</span>}
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
        className="mt-3 w-full resize-none rounded-rapi-md border-[1.5px] border-white/70 bg-white/70 px-4 py-3.5 text-sm leading-relaxed shadow-rapi-card outline-none backdrop-blur-xl transition-colors focus:border-rapi-blue"
      />

      {/* Preview hasil parse */}
      <div className="rapi-glass mt-4 rounded-rapi-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-rapi-gray-600">Preview</p>
          {input.trim() && (
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-bold',
                parsed.confidence === 'high' && 'bg-rapi-income-soft text-rapi-income',
                parsed.confidence === 'medium' && 'bg-rapi-warning-soft text-[#946800]',
                parsed.confidence === 'low' && 'bg-rapi-gray-100 text-rapi-gray-600',
              )}
            >
              {parsed.confidence === 'high' && 'Rapi ngerti! ✨'}
              {parsed.confidence === 'medium' && 'Cek kategorinya ya 👀'}
              {parsed.confidence === 'low' && 'Lengkapi nominalnya ya'}
            </span>
          )}
        </div>

        {/* Jenis */}
        <div className="mt-3 flex gap-2">
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
                'min-h-10 flex-1 rounded-rapi-sm text-xs font-bold transition-colors',
                type === id
                  ? id === 'expense'
                    ? 'bg-rapi-expense-soft text-rapi-expense'
                    : 'bg-rapi-income-soft text-rapi-income'
                  : 'bg-rapi-gray-100 text-rapi-gray-600',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Nominal */}
        <label htmlFor="tx-amount" className="mb-1.5 mt-4 block text-xs font-bold text-rapi-gray-600">
          Nominal
        </label>
        <div className="flex items-center rounded-rapi-md border-[1.5px] border-rapi-gray-300 transition-colors focus-within:border-rapi-blue">
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

        {/* Kategori */}
        <p className="mb-1.5 mt-4 text-xs font-bold text-rapi-gray-600">Kategori</p>
        <div className="flex flex-wrap gap-2">
          {typeCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setManualCategory(cat.id)}
              className={cn(
                'inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors',
                activeCategory === cat.id
                  ? 'bg-rapi-navy text-white'
                  : 'bg-rapi-gray-100/80 text-rapi-gray-600',
              )}
            >
              <Icon3D name={cat.id} size={17} fallback={cat.emoji} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <RapiButton
        variant="accent"
        onClick={handleSave}
        disabled={!canSave}
        className="mt-5 w-full text-base"
      >
        {canSave ? `Simpan ${formatRupiah(amount)} ✅` : 'Simpan Transaksi'}
      </RapiButton>
    </PageWrapper>
  )
}
