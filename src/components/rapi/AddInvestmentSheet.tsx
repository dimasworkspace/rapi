import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { formatRupiah } from '@/lib/formatters'
import { useT } from '@/lib/i18n'
import { FADE, SPRING_POP, TWEEN_EXIT } from '@/lib/motion'
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

// Input konsisten light & dark
const INV_INPUT =
  'rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 outline-none transition-colors focus-within:border-rapi-blue focus:border-rapi-blue dark:border-white/10 dark:bg-white/5 dark:text-rapi-dark-ink'

export function AddInvestmentSheet({ open, onClose }: AddInvestmentSheetProps) {
  const t = useT()
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
    showToast(t.investments.savedAsset)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="add-inv" className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label={t.common.close}
            onClick={onClose}
            className="absolute inset-0 bg-rapi-navy/20 dark:bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE}
          />
          <motion.div
            className="relative flex max-h-[88vh] w-full max-w-[26rem] flex-col overflow-hidden rounded-rapi-xl border border-white/60 bg-[#EAF1FF]/60 shadow-rapi-elevated backdrop-blur-2xl dark:border-white/10 dark:bg-rapi-dark-surface/85"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: SPRING_POP }}
            exit={{ opacity: 0, scale: 0.95, y: 10, transition: TWEEN_EXIT }}
          >
            <div className="flex items-center justify-between px-4 pb-1 pt-3.5">
              <h2 className="text-[15px] font-bold text-rapi-navy dark:text-rapi-dark-ink">
                {t.investments.addTitle}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.common.close}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-rapi-gray-600 transition-colors hover:bg-white/60 dark:hover:bg-white/10"
              >
                <X size={17} />
              </button>
            </div>

            <div className="overflow-y-auto px-4 pb-4 pt-1">
              {/* Tipe aset */}
              <div className="grid grid-cols-5 gap-1.5">
                {ASSET_TYPES.map((at) => (
                  <button
                    key={at.id}
                    type="button"
                    onClick={() => setType(at.id)}
                    className={cn(
                      'flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-rapi-md px-1 py-2 text-[10px] font-semibold leading-tight transition-colors',
                      type === at.id
                        ? 'bg-rapi-blue text-white shadow-rapi-card'
                        : 'border border-white/60 bg-white/45 text-rapi-gray-600 dark:border-white/10 dark:bg-white/5',
                    )}
                  >
                    <Icon3D name={at.id} size={20} fallback={at.emoji} />
                    <span className="w-full truncate text-center leading-tight">{at.label}</span>
                  </button>
                ))}
              </div>

              <label htmlFor="inv-name" className="mb-1 mt-3 block text-[13px] font-medium text-rapi-gray-600">
                {t.investments.assetName}
              </label>
              <input
                id="inv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.investments.assetNamePlaceholder}
                className={cn('w-full px-3.5 py-2.5 text-[13px] outline-none', INV_INPUT)}
              />

              <label htmlFor="inv-units" className="mb-1 mt-3 block text-[13px] font-medium text-rapi-gray-600">
                {t.investments.units}
              </label>
              <input
                id="inv-units"
                value={units}
                onChange={(e) => setUnits(decimal(e.target.value))}
                placeholder={t.investments.unitsPlaceholder}
                inputMode="decimal"
                className={cn('w-full px-3.5 py-2.5 text-[13px] font-semibold outline-none', INV_INPUT)}
              />

              <div className="mt-3 flex gap-2">
                <div className="flex-1">
                  <label htmlFor="inv-buy" className="mb-1 block text-[13px] font-medium text-rapi-gray-600">
                    {t.investments.buyPrice}
                  </label>
                  <div className={cn('flex items-center', INV_INPUT)}>
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
                    {t.investments.currentPrice}
                  </label>
                  <div className={cn('flex items-center', INV_INPUT)}>
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
                <div className="mt-3 flex items-center justify-between rounded-rapi-md bg-white/50 px-3.5 py-2.5 dark:bg-white/5">
                  <div>
                    <p className="text-[11px] font-medium text-rapi-gray-600">
                      {t.investments.currentValue}
                    </p>
                    <p className="text-[13px] font-bold text-rapi-navy dark:text-rapi-dark-ink">
                      {formatRupiah(value)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-[13px] font-semibold',
                      pl >= 0
                        ? 'bg-rapi-income-soft text-rapi-income dark:bg-rapi-income/20'
                        : 'bg-rapi-expense-soft text-rapi-expense dark:bg-rapi-expense/20',
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
                {canSave ? t.investments.saveAsset : t.investments.completeData}
              </RapiButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
