import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUiStore } from '@/store/uiStore'

/** Toast — pill navy muncul di atas bottom nav dengan spring, auto-hilang. */
export function Toast() {
  const toast = useUiStore((s) => s.toast)
  const hideToast = useUiStore((s) => s.hideToast)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(hideToast, 2600)
    return () => clearTimeout(timer)
  }, [toast, hideToast])

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-5">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 340, damping: 24 }}
            className="mx-auto w-fit max-w-full rounded-full bg-rapi-navy px-5 py-3 text-center text-sm font-bold text-white shadow-rapi-elevated"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
