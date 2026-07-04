import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Keyboard, Mic, X } from 'lucide-react'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { formatRupiah } from '@/lib/formatters'
import { parseInvestment, parseTransaction } from '@/lib/parser'
import { cn } from '@/lib/utils'
import { useCategoryStore } from '@/store/categoryStore'
import { useInvestmentStore } from '@/store/investmentStore'
import { useTransactionStore } from '@/store/transactionStore'
import { useUiStore } from '@/store/uiStore'
import { ASSET_TYPES, type TransactionType } from '@/types'

const MODES = [
  { id: 'text', label: 'Teks', icon: Keyboard, ready: true },
  { id: 'voice', label: 'Suara', icon: Mic, ready: false },
  { id: 'photo', label: 'Foto', icon: Camera, ready: false },
] as const

/** Form isi transaksi — state fresh tiap sheet dibuka. */
function AddTransactionForm({ onClose }: { onClose: () => void }) {
  const categories = useCategoryStore((s) => s.categories)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const addAsset = useInvestmentStore((s) => s.addAsset)
  const showToast = useUiStore((s) => s.showToast)

  const [input, setInput] = useState('')
  const [manualType, setManualType] = useState<TransactionType | null>(null)
  const [manualCategory, setManualCategory] = useState<string | null>(null)
  // User bisa nolak deteksi investasi → catat sebagai transaksi biasa
  const [forceNormal, setForceNormal] = useState(false)

  const parsed = useMemo(() => parseTransaction(input), [input])
  const invest = useMemo(() => parseInvestment(input), [input])
  const isInvest = invest.matched && !forceNormal
  const assetMeta = ASSET_TYPES.find((t) => t.id === invest.assetType)
  const assetName = invest.name || (assetMeta?.label ?? 'Aset')

  const type: TransactionType = manualType ?? parsed.type
  const category =
    manualCategory ?? (categories.some((c) => c.id === parsed.category) ? parsed.category : '')
  const amount = parsed.amount ?? 0

  const typeCategories = categories.filter((c) =>
    type === 'income' ? c.type === 'income' : c.type === 'expense',
  )
  const activeCategory = typeCategories.some((c) => c.id === category)
    ? category
    : (typeCategories[0]?.id ?? '')

  const canSave = isInvest ? amount > 0 : amount > 0 && activeCategory !== ''

  const handleSave = () => {
    if (!canSave) return
    if (isInvest) {
      // Masuk ke portofolio + tercatat sebagai pengeluaran kategori Investasi
      addAsset({
        type: invest.assetType,
        name: assetName,
        units: 1,
        buyPrice: amount,
        currentPrice: amount,
      })
      addTransaction({
        type: 'expense',
        amount,
        category: 'investasi',
        note: `Beli ${assetName}`,
        date: new Date().toISOString(),
        inputMethod: 'text',
        aiParsed: false,
      })
      showToast('Kecatat & masuk portofolio Investasi 📈')
      onClose()
      return
    }
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
    onClose()
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

      {isInvest ? (
        /* Panel investasi — kedetect dari kalimat, masuk otomatis ke tab Investasi */
        <div className="mt-3 rounded-rapi-md border border-rapi-blue/25 bg-rapi-blue/10 p-3">
          <div className="flex items-center gap-2.5">
            <Icon3D name={invest.assetType} size={28} fallback={assetMeta?.emoji ?? '📈'} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-rapi-navy">
                {assetName} · {assetMeta?.label}
              </p>
              <p className="text-[11px] leading-snug text-rapi-gray-600">
                Kedetect investasi — otomatis masuk tab Investasi 📈
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForceNormal(true)}
            className="mt-2 text-[11px] font-semibold text-rapi-blue"
          >
            Bukan investasi? Catat sebagai transaksi biasa
          </button>
        </div>
      ) : (
        <>
      {/* Jenis — fokus pilihan Keluar / Masuk */}
      <div className="mt-3 flex rounded-rapi-md bg-white/50 p-1">
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
              'flex-1 rounded-[7px] py-2 text-xs font-bold transition-colors',
              type === id
                ? id === 'expense'
                  ? 'bg-rapi-expense-soft text-rapi-expense'
                  : 'bg-rapi-income-soft text-rapi-income'
                : 'text-rapi-gray-600',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Kategori — grid rapi & center, otomatis kepilih dari parser */}
      <p className="mb-2 mt-3 text-center text-[11px] font-bold uppercase tracking-wide text-rapi-gray-600">
        Kategori
      </p>
      <div className="grid grid-cols-4 gap-2">
        {typeCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setManualCategory(cat.id)}
            className={cn(
              'flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-rapi-md px-1 py-2 text-[10px] font-bold transition-colors',
              activeCategory === cat.id
                ? 'bg-rapi-blue text-white shadow-rapi-card'
                : 'border border-white/60 bg-white/45 text-rapi-gray-600',
            )}
          >
            <Icon3D name={cat.id} size={22} fallback={cat.emoji} />
            <span className="w-full truncate text-center leading-tight">{cat.name}</span>
          </button>
        ))}
      </div>
        </>
      )}

      <RapiButton
        variant="blue"
        onClick={handleSave}
        disabled={!canSave}
        className="mt-4 w-full text-base active:scale-[0.98]"
      >
        {canSave
          ? isInvest
            ? `Simpan Investasi ${formatRupiah(amount)} 📈`
            : `Simpan ${formatRupiah(amount)} ✅`
          : 'Simpan Transaksi'}
      </RapiButton>
    </>
  )
}

/** Modal di tengah layar — biru glass transparan, pop-in dari FAB (Framer Motion). */
export function AddTransactionSheet() {
  const open = useUiStore((s) => s.addOpen)
  const closeAdd = useUiStore((s) => s.closeAdd)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAdd()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeAdd])

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="add-sheet" className="fixed inset-0 z-40 flex items-center justify-center p-4">
          {/* Backdrop tipis — layar utama tetap terlihat, sekadar meredup */}
          <motion.button
            type="button"
            aria-label="Tutup"
            onClick={closeAdd}
            className="absolute inset-0 bg-rapi-navy/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal — biru glass transparan, spring pop-in/out */}
          <motion.div
            className="relative flex max-h-[85vh] w-full max-w-[26rem] flex-col overflow-hidden rounded-rapi-xl border border-white/60 bg-[#EAF1FF]/60 shadow-rapi-elevated backdrop-blur-2xl"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
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
              <AddTransactionForm onClose={closeAdd} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
