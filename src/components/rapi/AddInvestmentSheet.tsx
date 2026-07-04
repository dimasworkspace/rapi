import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { formatRupiah } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { useInvestmentStore } from '@/store/investmentStore'
import { useUiStore } from '@/store/uiStore'
import { ASSET_TYPES, type AssetType } from '@/types'

interface AddInvestmentSheetProps {
  open: boolean
  onClose: () => void
}

const digits = (v: string) => v.replace(/\D/g, '')
const decimal = (v: string) => v.replace(/[^\d.,]/g, '').replace(',', '.')

export function AddInvestmentSheet({ open, onClose }: AddInvestmentSheetProps) {
  const addAsset = useInvestmentStore((s) => s.addAsset)
  const showToast = useUiStore((s) => s.showToast)

  const [type, setType] = useState<AssetType>('saham')
  const [name, setName] = useState('')
  const [units, setUnits] = useState('')
  const [buy, setBuy] = useState('')
  const [current, setCurrent] = useState('')

  // Reset tiap kali dibuka
  useEffect(() => {
    if (open) {
      setType('saham')
      setName('')
      setUnits('')
      setBuy('')
      setCurrent('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const unitsNum = parseFloat(units) || 0
  const buyNum = parseInt(buy || '0', 10)
  const currentNum = parseInt(current || '0', 10)
  const modal = unitsNum * buyNum
  const value = unitsNum * currentNum
  const pl = value - modal
  const plPct = modal > 0 ? (pl / modal) * 100 : 0

  const canSave = name.trim() !== '' && unitsNum > 0 && buyNum > 0 && currentNum > 0

  const handleSave = () => {
    if (!canSave) return
    addAsset({ type, name: name.trim(), units: unitsNum, buyPrice: buyNum, currentPrice: currentNum })
    showToast('Aset kecatat! Portofoliomu makin rapi 📈')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="add-inv" className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="absolute inset-0 bg-rapi-navy/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="relative flex max-h-[88vh] w-full max-w-[26rem] flex-col overflow-hidden rounded-rapi-xl border border-white/60 bg-[#EAF1FF]/60 shadow-rapi-elevated backdrop-blur-2xl"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <div className="flex items-center justify-between px-4 pb-1 pt-3.5">
              <h2 className="text-[15px] font-bold text-rapi-navy">Tambah Aset</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="-mr-1.5 flex h-8 w-8 items-center justify-center rounded-full text-rapi-gray-600 transition-colors hover:bg-white/60"
              >
                <X size={17} />
              </button>
            </div>

            <div className="overflow-y-auto px-4 pb-4 pt-1">
              {/* Tipe aset */}
              <div className="grid grid-cols-5 gap-1.5">
                {ASSET_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-rapi-md px-1 py-2 text-[9px] font-semibold transition-colors',
                      type === t.id
                        ? 'bg-rapi-blue text-white shadow-rapi-card'
                        : 'border border-white/60 bg-white/45 text-rapi-gray-600',
                    )}
                  >
                    <Icon3D name={t.id} size={20} fallback={t.emoji} />
                    <span className="w-full truncate text-center leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>

              <label htmlFor="inv-name" className="mb-1 mt-3 block text-[13px] font-medium text-rapi-gray-600">
                Nama aset
              </label>
              <input
                id="inv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth: BBCA, Bitcoin, Emas Antam"
                className="w-full rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-rapi-blue"
              />

              <label htmlFor="inv-units" className="mb-1 mt-3 block text-[13px] font-medium text-rapi-gray-600">
                Jumlah unit / lot / gram
              </label>
              <input
                id="inv-units"
                value={units}
                onChange={(e) => setUnits(decimal(e.target.value))}
                placeholder="cth: 10"
                inputMode="decimal"
                className="w-full rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 px-3.5 py-2.5 text-[13px] font-semibold outline-none transition-colors focus:border-rapi-blue"
              />

              <div className="mt-3 flex gap-2">
                <div className="flex-1">
                  <label htmlFor="inv-buy" className="mb-1 block text-[13px] font-medium text-rapi-gray-600">
                    Harga beli / unit
                  </label>
                  <div className="flex items-center rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 focus-within:border-rapi-blue">
                    <span className="pl-2.5 text-[13px] font-semibold text-rapi-gray-600">Rp</span>
                    <input
                      id="inv-buy"
                      value={buy ? new Intl.NumberFormat('id-ID').format(parseInt(buy, 10)) : ''}
                      onChange={(e) => setBuy(digits(e.target.value))}
                      placeholder="0"
                      inputMode="numeric"
                      className="w-full bg-transparent px-1.5 py-2.5 text-[13px] font-semibold outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label htmlFor="inv-now" className="mb-1 block text-[13px] font-medium text-rapi-gray-600">
                    Harga kini / unit
                  </label>
                  <div className="flex items-center rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 focus-within:border-rapi-blue">
                    <span className="pl-2.5 text-[13px] font-semibold text-rapi-gray-600">Rp</span>
                    <input
                      id="inv-now"
                      value={current ? new Intl.NumberFormat('id-ID').format(parseInt(current, 10)) : ''}
                      onChange={(e) => setCurrent(digits(e.target.value))}
                      placeholder="0"
                      inputMode="numeric"
                      className="w-full bg-transparent px-1.5 py-2.5 text-[13px] font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Preview nilai & P/L */}
              {value > 0 && (
                <div className="mt-3 flex items-center justify-between rounded-rapi-md bg-white/50 px-3.5 py-2.5">
                  <div>
                    <p className="text-[11px] font-medium text-rapi-gray-600">Nilai sekarang</p>
                    <p className="text-[13px] font-bold text-rapi-navy">{formatRupiah(value)}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-[13px] font-semibold',
                      pl >= 0 ? 'bg-rapi-income-soft text-rapi-income' : 'bg-rapi-expense-soft text-rapi-expense',
                    )}
                  >
                    {pl >= 0 ? '↑' : '↓'} {plPct.toFixed(1).replace('.', ',')}%
                  </span>
                </div>
              )}

              <RapiButton
                variant="blue"
                onClick={handleSave}
                disabled={!canSave}
                className="mt-4 w-full text-base active:scale-[0.98]"
              >
                {canSave ? `Simpan Aset 📈` : 'Lengkapi data aset'}
              </RapiButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
