import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, ChevronDown, Keyboard, Loader2, Mic, X } from 'lucide-react'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiMascot } from '@/components/rapi/RapiMascot'
import { aiReady, parseReceiptWithAi, RapiAiError } from '@/lib/ai'
import { formatRupiah } from '@/lib/formatters'
import { useT } from '@/lib/i18n'
import { FADE, SPRING_POP, TWEEN_EXIT } from '@/lib/motion'
import { parseInvestment, parseTransaction } from '@/lib/parser'
import { cn } from '@/lib/utils'
import { useCategoryStore } from '@/store/categoryStore'
import { useInvestmentStore } from '@/store/investmentStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useTransactionStore } from '@/store/transactionStore'
import { useUiStore } from '@/store/uiStore'
import { ASSET_TYPES, type InputMethod, type TransactionType } from '@/types'

const MODES = [
  { id: 'text', icon: Keyboard },
  { id: 'voice', icon: Mic },
  { id: 'photo', icon: Camera },
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
  const t = useT()
  const lang = useSettingsStore((s) => s.lang)
  const categories = useCategoryStore((s) => s.categories)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const removeTransaction = useTransactionStore((s) => s.removeTransaction)
  const addAsset = useInvestmentStore((s) => s.addAsset)
  const removeAsset = useInvestmentStore((s) => s.removeAsset)
  const showToast = useUiStore((s) => s.showToast)
  const pendingPhoto = useUiStore((s) => s.pendingPhoto)
  const clearPendingPhoto = useUiStore((s) => s.clearPendingPhoto)

  const MODE_LABEL: Record<string, string> = {
    text: t.add.modeText,
    voice: t.add.modeVoice,
    photo: t.add.modePhoto,
  }

  const [input, setInput] = useState('')
  const [manualType, setManualType] = useState<TransactionType | null>(null)
  const [manualCategory, setManualCategory] = useState<string | null>(null)
  // User bisa nolak deteksi investasi → catat sebagai transaksi biasa
  const [forceNormal, setForceNormal] = useState(false)
  // Jenis + grid kategori: tertutup sampai user memang mau mengoreksi
  const [detailOpen, setDetailOpen] = useState(false)

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
      showToast(t.add.voiceUnsupported)
      return
    }
    const rec = new Recognition()
    rec.lang = lang === 'en' ? 'en-US' : 'id-ID'
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
        showToast(t.add.micDenied)
      } else if (e.error !== 'aborted') {
        showToast(t.add.voiceError)
      }
    }
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }

  const handlePhotoClick = () => {
    if (!aiReady()) {
      showToast(t.add.photoNeedsKey)
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
        showToast(t.add.receiptFail)
        return
      }
      // Prefill form — user tinggal cek & simpan
      setInput(`${result.note || 'Belanja'} ${result.amount}`)
      setManualType(result.type)
      if (result.category) setManualCategory(result.category)
      setInputMethod('photo')
      setWasAiParsed(true)
      showToast(t.add.receiptOk)
    } catch (e) {
      showToast(e instanceof RapiAiError ? e.message : t.ai.genericError)
    } finally {
      setScanning(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // Foto struk yang dikirim dari app lain — langsung dipindai begitu form kebuka.
  // Sengaja pakai ref supaya nggak kepicu dua kali oleh render ulang.
  const sharedPhotoHandled = useRef(false)
  useEffect(() => {
    if (!pendingPhoto || sharedPhotoHandled.current) return
    sharedPhotoHandled.current = true
    clearPendingPhoto()
    void handlePhoto(pendingPhoto)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPhoto])

  const parsed = useMemo(() => parseTransaction(input), [input])
  const invest = useMemo(() => parseInvestment(input), [input])
  const isInvest = invest.matched && !forceNormal
  const assetMeta = ASSET_TYPES.find((a) => a.id === invest.assetType)
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
  const activeCat = typeCategories.find((c) => c.id === activeCategory)

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
      showToast(t.add.savedInvest, () => {
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
    showToast(t.add.saved, () => removeTransaction(txId))
    onClose()
  }

  return (
    <div className="relative">
      {/* Overlay saat scan struk — feedback jelas selama AI vision jalan (aturan progressive-loading) */}
      {scanning && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-rapi-lg bg-[#EAF1FF]/80 text-center backdrop-blur-sm dark:bg-rapi-dark-surface/85">
          <RapiMascot size={96} />
          <div>
            <p className="text-sm font-bold text-rapi-navy dark:text-rapi-dark-ink">
              {t.add.scanningTitle}
            </p>
            <p className="mt-0.5 text-[12px] text-rapi-gray-600">{t.add.scanningDesc}</p>
          </div>
          {/* Skeleton shimmer meniru baris hasil */}
          <div className="mt-1 w-40 space-y-1.5">
            <div className="h-2.5 animate-pulse rounded-full bg-rapi-blue/20" />
            <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-rapi-blue/15" />
          </div>
        </div>
      )}

      {/* ===== HERO: mode input + tulis transaksi ===== */}
      <div className="grid grid-cols-3 gap-2">
        {MODES.map(({ id, icon: Icon }) => {
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
                  : 'border border-rapi-blue/30 bg-white/50 text-rapi-blue hover:bg-rapi-blue/10 dark:bg-white/5',
                disabled && 'opacity-50',
              )}
            >
              {id === 'photo' && scanning ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Icon size={14} />
              )}
              {id === 'voice' && listening
                ? t.add.listening
                : id === 'photo' && scanning
                  ? t.add.reading
                  : MODE_LABEL[id]}
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
        {t.add.title}
      </label>
      <textarea
        id="tx-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={listening ? t.add.voicePlaceholder : t.add.placeholder}
        rows={2}
        autoFocus
        className="mt-2.5 w-full resize-none rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-rapi-blue dark:border-white/10 dark:bg-white/5 dark:text-rapi-dark-ink"
      />

      {/* Contoh cepat — sekali klik langsung keisi (belajar format tanpa mikir) */}
      {input.trim() === '' && !listening && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['makan siang 25rb', 'gaji 3jt', 'bensin 20rb'].map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setInput(ex)}
              className="rounded-full border border-rapi-blue/25 bg-white/60 px-2.5 py-1 text-[11px] font-semibold text-rapi-blue transition-all hover:bg-rapi-blue hover:text-white active:scale-95 dark:bg-white/5"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {isInvest ? (
        /* Panel investasi — kedetect dari kalimat, masuk otomatis ke tab Investasi */
        <div className="mt-3 rounded-rapi-md border border-rapi-blue/25 bg-rapi-blue/10 p-3">
          <div className="flex items-center gap-2.5">
            <Icon3D name={invest.assetType} size={28} fallback={assetMeta?.emoji ?? '📈'} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-rapi-navy dark:text-rapi-dark-ink">
                {assetName} · {assetMeta?.label}
              </p>
              <p className="text-[11px] leading-snug text-rapi-gray-600">{t.add.investDetected}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForceNormal(true)}
            className="mt-2 text-[11px] font-semibold text-rapi-blue"
          >
            {t.add.notInvest}
          </button>
        </div>
      ) : (
        <>
          {/* Hasil baca. Parser SUDAH menebak jenis & kategori, jadi baris ini
              tombol koreksi — bukan tempat mengisi. Detail teknisnya (jenis +
              grid kategori) sengaja disembunyikan: menampilkan 11 pilihan yang
              sudah terjawab bikin user mengira ada 11 keputusan yang wajib
              diambil, padahal nol. */}
          {input.trim() !== '' && (
            <button
              type="button"
              onClick={() => setDetailOpen((v) => !v)}
              aria-expanded={detailOpen}
              aria-live="polite"
              className="mt-2.5 flex w-full items-center gap-2.5 rounded-rapi-md border border-rapi-blue/20 bg-white/70 px-3 py-2.5 text-left transition-colors hover:border-rapi-blue/40 dark:border-white/10 dark:bg-white/5"
            >
              {amount > 0 ? (
                <>
                  <Icon3D
                    name={activeCategory}
                    size={24}
                    fallback={activeCat?.emoji ?? '💸'}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'tabular-nums block truncate text-[15px] font-bold leading-tight',
                        type === 'income' ? 'text-rapi-income' : 'text-rapi-navy dark:text-rapi-dark-ink',
                      )}
                    >
                      {formatRupiah(amount)}
                    </span>
                    <span className="block truncate text-[11px] text-rapi-gray-600">
                      {activeCat?.name ?? t.common.uncategorized} ·{' '}
                      {type === 'income' ? t.common.income : t.common.expense}
                      {!detailOpen && ` · ${t.add.detailHint}`}
                    </span>
                  </span>
                </>
              ) : (
                <span className="flex-1 text-[11px] font-semibold text-rapi-gray-600">
                  {t.add.parsedFail}
                </span>
              )}
              <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-rapi-blue">
                {t.add.edit}
                <ChevronDown
                  size={14}
                  className={cn('transition-transform', detailOpen && 'rotate-180')}
                />
              </span>
            </button>
          )}

          <AnimatePresence initial={false}>
            {detailOpen && (
              <motion.div
                key="tx-detail"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
      {/* Jenis — fokus pilihan Keluar / Masuk */}
      <div className="mt-3 flex rounded-rapi-md bg-white/50 p-1 dark:bg-white/5">
        {(
          [
            { id: 'expense', label: t.add.expenseTab },
            { id: 'income', label: t.add.incomeTab },
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
                  ? 'bg-rapi-expense-soft text-rapi-expense dark:bg-rapi-expense/20'
                  : 'bg-rapi-income-soft text-rapi-income dark:bg-rapi-income/20'
                : 'text-rapi-gray-600',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Kategori — grid rapi & center, otomatis kepilih dari parser */}
      <p className="mb-2 mt-3 text-center text-[11px] font-bold uppercase tracking-wide text-rapi-gray-600">
        {t.common.category}
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
                : 'border border-white/60 bg-white/45 text-rapi-gray-600 dark:border-white/10 dark:bg-white/5',
            )}
          >
            <Icon3D name={cat.id} size={22} fallback={cat.emoji} />
            <span className="w-full truncate text-center leading-tight">{cat.name}</span>
          </button>
        ))}
      </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            ? t.add.saveInvest(formatRupiah(amount))
            : t.add.save(formatRupiah(amount))
          : t.add.saveDefault}
      </RapiButton>
    </div>
  )
}

/** Modal di tengah layar — biru glass transparan, pop-in dari FAB (Framer Motion). */
export function AddTransactionSheet() {
  const t = useT()
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
        <motion.div
          key="add-sheet"
          className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Backdrop tipis — layar utama tetap terlihat, sekadar meredup */}
          <motion.button
            type="button"
            aria-label={t.common.close}
            onClick={closeAdd}
            className="absolute inset-0 bg-rapi-navy/20 dark:bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE}
          />

          {/* Bottom sheet — naik dari bawah, menempel di sisi keyboard. Ibu jari
              ada di bawah dan keyboard datang dari bawah; modal di tengah layar
              kejepit dua-duanya begitu keyboard naik. Di layar lebar (sm+) balik
              jadi kartu mengambang di tengah. */}
          <motion.div
            className="relative flex max-h-[88dvh] w-full max-w-[26rem] flex-col overflow-hidden rounded-t-rapi-xl border border-white/60 bg-rapi-offwhite/95 shadow-rapi-elevated backdrop-blur-xl dark:border-white/10 dark:bg-rapi-dark-surface/95 sm:rounded-rapi-xl"
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: SPRING_POP }}
            exit={{ y: '100%', transition: TWEEN_EXIT }}
          >
            {/* Grabber — penanda visual "ini bisa ditarik/ditutup" ala sheet native */}
            <div className="flex justify-center pt-2.5" aria-hidden>
              <span className="h-1 w-9 rounded-full bg-rapi-gray-300 dark:bg-white/20" />
            </div>

            <div className="flex items-center justify-between px-4 pb-1 pt-2">
              <h2 className="text-[15px] font-bold text-rapi-navy dark:text-rapi-dark-ink">
                {t.add.title}
              </h2>
              <button
                type="button"
                onClick={closeAdd}
                aria-label={t.common.close}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-rapi-gray-600 transition-colors hover:bg-white/60 dark:hover:bg-white/10"
              >
                <X size={17} />
              </button>
            </div>

            <div className="overflow-y-auto px-4 pt-1 pb-[max(env(safe-area-inset-bottom),1rem)]">
              <AddTransactionForm onClose={closeAdd} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
