import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Keyboard, Loader2, Mic, X } from 'lucide-react'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { aiReady, parseReceiptWithAi, RapiAiError } from '@/lib/ai'
import { formatRupiah } from '@/lib/formatters'
import { FADE, SPRING_POP, TWEEN_EXIT } from '@/lib/motion'
import { parseInvestment, parseTransaction } from '@/lib/parser'
import { cn } from '@/lib/utils'
import { useCategoryStore } from '@/store/categoryStore'
import { useInvestmentStore } from '@/store/investmentStore'
import { useTransactionStore } from '@/store/transactionStore'
import { useUiStore } from '@/store/uiStore'
import { ASSET_TYPES, type InputMethod, type TransactionType } from '@/types'

const MODES = [
  { id: 'text', label: 'Teks', icon: Keyboard },
  { id: 'voice', label: 'Suara', icon: Mic },
  { id: 'photo', label: 'Foto', icon: Camera },
] as const

const getSpeechRecognition = (): SpeechRecognitionConstructor | undefined =>
  window.SpeechRecognition ?? window.webkitSpeechRecognition

/** Baca file gambar jadi base64 murni (tanpa prefix data URL). */
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(new Error('read failed'))
    reader.readAsDataURL(file)
  })

/** Form isi transaksi — state fresh tiap sheet dibuka. */
function AddTransactionForm({ onClose }: { onClose: () => void }) {
  const categories = useCategoryStore((s) => s.categories)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const removeTransaction = useTransactionStore((s) => s.removeTransaction)
  const addAsset = useInvestmentStore((s) => s.addAsset)
  const removeAsset = useInvestmentStore((s) => s.removeAsset)
  const showToast = useUiStore((s) => s.showToast)

  const [input, setInput] = useState('')
  const [manualType, setManualType] = useState<TransactionType | null>(null)
  const [manualCategory, setManualCategory] = useState<string | null>(null)
  // User bisa nolak deteksi investasi → catat sebagai transaksi biasa
  const [forceNormal, setForceNormal] = useState(false)

  // ===== Mode input: voice (Web Speech API) & photo (AI vision) =====
  const [listening, setListening] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [inputMethod, setInputMethod] = useState<InputMethod>('text')
  const [wasAiParsed, setWasAiParsed] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const voiceSupported = getSpeechRecognition() !== undefined

  // Matikan mic kalau form ditutup di tengah jalan
  useEffect(() => () => recognitionRef.current?.abort(), [])

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const Recognition = getSpeechRecognition()
    if (!Recognition) {
      showToast('Browser ini belum bisa input suara. Coba Chrome ya 😊')
      return
    }
    const rec = new Recognition()
    rec.lang = 'id-ID'
    rec.continuous = false
    rec.interimResults = true
    rec.onresult = (e) => {
      let transcript = ''
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript
      setInput(transcript)
      setInputMethod('voice')
    }
    rec.onerror = (e) => {
      setListening(false)
      if (e.error === 'not-allowed') {
        showToast('Izinin akses mikrofonnya dulu ya 🎙️')
      } else if (e.error !== 'aborted') {
        showToast('Suaranya nggak kedengeran nih. Coba lagi ya 😊')
      }
    }
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }

  const handlePhotoClick = () => {
    if (!aiReady()) {
      showToast('Scan struk butuh API key — isi dulu di Profil ya 🔑')
      return
    }
    fileRef.current?.click()
  }

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return
    setScanning(true)
    try {
      const base64 = await fileToBase64(file)
      const result = await parseReceiptWithAi(
        base64,
        file.type || 'image/jpeg',
        categories.map((c) => c.id),
      )
      if (!result.amount) {
        showToast('Struknya susah kebaca nih. Coba foto ulang yang lebih jelas ya 📸')
        return
      }
      // Prefill form — user tinggal cek & simpan
      setInput(`${result.note || 'Belanja'} ${result.amount}`)
      setManualType(result.type)
      if (result.category) setManualCategory(result.category)
      setInputMethod('photo')
      setWasAiParsed(true)
      showToast('Struk kebaca! Cek dulu terus simpan ya ✨')
    } catch (e) {
      showToast(
        e instanceof RapiAiError ? e.message : 'Oops, ada yang salah nih. Coba lagi ya 😊',
      )
    } finally {
      setScanning(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

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
      const assetId = addAsset({
        type: invest.assetType,
        name: assetName,
        units: 1,
        buyPrice: amount,
        currentPrice: amount,
      })
      const txId = addTransaction({
        type: 'expense',
        amount,
        category: 'investasi',
        note: `Beli ${assetName}`,
        date: new Date().toISOString(),
        inputMethod,
        aiParsed: wasAiParsed,
      })
      showToast('Kecatat & masuk portofolio Investasi 📈', () => {
        removeAsset(assetId)
        removeTransaction(txId)
      })
      onClose()
      return
    }
    const txId = addTransaction({
      type,
      amount,
      category: activeCategory,
      note: parsed.note,
      date: new Date().toISOString(),
      inputMethod,
      aiParsed: wasAiParsed,
    })
    showToast('Kecatat! Keuanganmu makin rapi 💪', () => removeTransaction(txId))
    onClose()
  }

  return (
    <>
      {/* ===== HERO: mode input + tulis transaksi ===== */}
      <div className="grid grid-cols-3 gap-2">
        {MODES.map(({ id, label, icon: Icon }) => {
          const active =
            id === 'text' ? !listening && !scanning : id === 'voice' ? listening : scanning
          const disabled = (id === 'voice' && !voiceSupported) || (id === 'photo' && scanning)
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={id === 'voice' ? toggleVoice : id === 'photo' ? handlePhotoClick : undefined}
              className={cn(
                'flex min-h-9 items-center justify-center gap-1.5 rounded-rapi-md text-xs font-bold transition-colors',
                active
                  ? id === 'voice'
                    ? 'animate-rapi-pulse bg-rapi-expense text-white'
                    : 'bg-rapi-blue text-white shadow-rapi-card'
                  : 'border border-rapi-blue/30 bg-white/50 text-rapi-blue hover:bg-rapi-blue/10',
                disabled && 'opacity-50',
              )}
            >
              {id === 'photo' && scanning ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Icon size={14} />
              )}
              {id === 'voice' && listening
                ? 'Dengerin…'
                : id === 'photo' && scanning
                  ? 'Baca…'
                  : label}
            </button>
          )
        })}
      </div>

      {/* Input file tersembunyi — kamera/galeri untuk scan struk */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => handlePhoto(e.target.files?.[0])}
      />

      <label htmlFor="tx-input" className="sr-only">
        Tulis transaksi
      </label>
      <textarea
        id="tx-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          listening
            ? "Ngomong aja santai: 'makan siang dua puluh lima ribu' 🎙️"
            : 'Tulis santai aja, contoh:\n"makan siang 25rb" · "gaji 3jt"'
        }
        rows={2}
        autoFocus
        className="mt-2.5 w-full resize-none rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-rapi-blue"
      />

      {/* Contoh cepat — sekali klik langsung keisi (belajar format tanpa mikir) */}
      {input.trim() === '' && !listening && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['makan siang 25rb', 'gaji 3jt', 'bensin 20rb'].map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setInput(ex)}
              className="rounded-full border border-rapi-blue/25 bg-white/60 px-2.5 py-1 text-[11px] font-semibold text-rapi-blue transition-all hover:bg-rapi-blue hover:text-white active:scale-95"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Preview hasil parsing — user yakin dulu sebelum simpan */}
      {input.trim() !== '' && !isInvest && (
        <p
          className={cn(
            'mt-1.5 px-0.5 text-[11px] font-semibold',
            amount > 0 ? 'text-rapi-income' : 'text-rapi-gray-600',
          )}
          aria-live="polite"
        >
          {amount > 0
            ? `Kebaca: ${formatRupiah(amount)} · ${
                categories.find((c) => c.id === activeCategory)?.name ?? 'Lainnya'
              } · ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`
            : 'Nominalnya belum kebaca — tulis angkanya ya, contoh: 25rb 😊'}
        </p>
      )}

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
            transition={FADE}
          />

          {/* Modal — biru glass transparan; enter spring, exit lebih cepat */}
          <motion.div
            className="relative flex max-h-[85vh] w-full max-w-[26rem] flex-col overflow-hidden rounded-rapi-xl border border-white/60 bg-[#EAF1FF]/60 shadow-rapi-elevated backdrop-blur-2xl"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: SPRING_POP }}
            exit={{ opacity: 0, scale: 0.95, y: 10, transition: TWEEN_EXIT }}
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
