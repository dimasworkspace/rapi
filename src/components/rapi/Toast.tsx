import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SPRING_SOFT, TWEEN_EXIT } from '@/lib/motion'
import { useUiStore } from '@/store/uiStore'

/** Toast — pill navy muncul di atas bottom nav dengan spring, auto-hilang.
 *  Kalau ada aksi undo, nampilin tombol "Urungkan" & tampil lebih lama. */
export function Toast() {
  const toast = useUiStore((s) => s.toast)
  const hideToast = useUiStore((s) => s.hideToast)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(hideToast, toast.onUndo ? 4500 : 2600)
    return () => clearTimeout(timer)
  }, [toast, hideToast])

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-5">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.message}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_SOFT }}
            exit={{ opacity: 0, y: 10, scale: 0.95, transition: TWEEN_EXIT }}
            className="pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-3 rounded-full bg-rapi-navy py-3 pl-5 pr-4 text-center text-sm font-bold text-white shadow-rapi-elevated"
          >
            {toast.message}
            {toast.onUndo && (
              <button
                type="button"
                onClick={() => {
                  toast.onUndo?.()
                  hideToast()
                }}
                className="shrink-0 rounded-full bg-rapi-yellow px-3 py-1 text-xs font-bold text-rapi-navy transition-transform active:scale-95"
              >
                Urungkan
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
