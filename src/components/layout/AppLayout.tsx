import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { BottomNav } from '@/components/layout/BottomNav'
import { AddTransactionSheet } from '@/components/rapi/AddTransactionSheet'
import { Toast } from '@/components/rapi/Toast'

/** Konten route dengan transisi halus antar-tab (fade + slide). */
function AnimatedOutlet() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}

/** Kerangka app: konten max-w mobile di tengah + bottom nav menempel bawah. */
export function AppLayout() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md pb-28">
      <AmbientBackground />
      <AnimatedOutlet />
      <AddTransactionSheet />
      <Toast />
      <BottomNav />
    </div>
  )
}
