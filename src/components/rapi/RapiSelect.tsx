import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { SPRING_SOFT, TWEEN_EXIT } from '@/lib/motion'
import { cn } from '@/lib/utils'

export interface RapiSelectOption {
  value: string
  label: string
}

interface RapiSelectProps {
  value: string
  onChange: (value: string) => void
  options: RapiSelectOption[]
  ariaLabel?: string
}

/** Dropdown custom on-brand (ganti <select> native biar konsisten light & dark). */
export function RapiSelect({ value, onChange, options, ariaLabel }: RapiSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  // Tutup saat klik di luar / tekan Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="flex w-full items-center justify-between rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 py-2.5 pl-3 pr-3 text-[13px] font-semibold text-rapi-navy outline-none transition-colors focus-visible:border-rapi-blue dark:border-white/10 dark:bg-white/5 dark:text-rapi-dark-ink"
      >
        <span className="truncate">{selected?.label ?? '—'}</span>
        <ChevronDown
          size={16}
          className={cn('shrink-0 text-rapi-gray-600 transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_SOFT }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: TWEEN_EXIT }}
            className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-rapi-md border border-rapi-gray-300/60 bg-white p-1 shadow-rapi-elevated dark:border-white/10 dark:bg-rapi-dark-surface"
          >
            {options.map((opt) => {
              const active = opt.value === value
              return (
                <li key={opt.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-[9px] px-2.5 py-2 text-left text-[13px] font-semibold transition-colors',
                      active
                        ? 'bg-rapi-blue/10 text-rapi-blue dark:bg-rapi-blue/25 dark:text-white'
                        : 'text-rapi-navy hover:bg-rapi-gray-100 dark:text-rapi-dark-ink dark:hover:bg-white/5',
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {active && <Check size={15} className="shrink-0" />}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
