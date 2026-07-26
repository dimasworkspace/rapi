import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useT } from '@/lib/i18n'
import { FADE, SPRING_POP, TWEEN_EXIT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'

/** Dialog konfirmasi on-brand — ganti confirm() native, konsisten light & dark. */
export function RapiConfirm() {
  const t = useT()
  const confirm = useUiStore((s) => s.confirm)
  const hideConfirm = useUiStore((s) => s.hideConfirm)

  // Escape buat batal (aturan escape-routes)
  useEffect(() => {
    if (!confirm) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && hideConfirm()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirm, hideConfirm])

  return (
    <AnimatePresence>
      {confirm && (
        <motion.div
          key="confirm"
          className="fixed inset-0 z-[60] flex items-center justify-center p-5"
          role="alertdialog"
          aria-modal="true"
        >
          {/* Scrim cukup pekat biar fokus (aturan scrim-and-modal-legibility) */}
          <motion.button
            type="button"
            aria-label={t.common.cancel}
            onClick={hideConfirm}
            className="absolute inset-0 bg-rapi-navy/40 dark:bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE}
          />

          <motion.div
            className="rapi-glass relative w-full max-w-xs rounded-rapi-xl bg-white/90 p-5 text-center shadow-rapi-elevated dark:bg-rapi-dark-surface/95"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: SPRING_POP }}
            exit={{ opacity: 0, scale: 0.95, y: 8, transition: TWEEN_EXIT }}
          >
            <p className="text-[14px] font-semibold leading-relaxed text-rapi-navy dark:text-rapi-dark-ink">
              {confirm.message}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={hideConfirm}
                className="min-h-11 flex-1 rounded-rapi-md bg-rapi-gray-100 text-sm font-bold text-rapi-navy transition-transform active:scale-[0.97] dark:bg-white/10 dark:text-rapi-dark-ink"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirm.onConfirm()
                  hideConfirm()
                }}
                className={cn(
                  'min-h-11 flex-1 rounded-rapi-md text-sm font-bold text-white transition-transform active:scale-[0.97]',
                  confirm.danger ? 'bg-rapi-expense' : 'bg-rapi-blue',
                )}
              >
                {confirm.confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
