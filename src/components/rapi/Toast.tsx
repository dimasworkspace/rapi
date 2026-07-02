import { useEffect } from 'react'
import { useUiStore } from '@/store/uiStore'

/** Toast sederhana — pill navy muncul di atas bottom nav, auto-hilang. */
export function Toast() {
  const toast = useUiStore((s) => s.toast)
  const hideToast = useUiStore((s) => s.hideToast)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(hideToast, 2600)
    return () => clearTimeout(timer)
  }, [toast, hideToast])

  if (!toast) return null

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-5">
      <div className="mx-auto w-fit max-w-full animate-rapi-fade-up rounded-full bg-rapi-navy px-5 py-3 text-center text-sm font-bold text-white shadow-rapi-elevated">
        {toast}
      </div>
    </div>
  )
}
