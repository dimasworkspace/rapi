import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { BottomNav } from '@/components/layout/BottomNav'
import { AddTransactionSheet } from '@/components/rapi/AddTransactionSheet'
import { Toast } from '@/components/rapi/Toast'
import { EASE_PAGE } from '@/lib/motion'

/** Urutan spasial tab — dipakai buat nentuin arah slide antar halaman. */
const ROUTE_ORDER: Record<string, number> = {
  '/': 0,
  '/transaksi': 1,
  '/laporan': 2,
  '/ai': 3,
  '/investasi': 4,
  '/profil': 5,
}

/** Konten route dengan transisi halus antar-tab.
 *  Tanpa fase exit — halaman baru langsung gantiin yang lama
 *  (nggak ada jeda kosong/kedipan), cuma enter fade+slide.
 *  Arah slide ngikutin posisi tab (aturan navigation-direction):
 *  pindah ke tab kanan → konten masuk dari kanan, dan sebaliknya. */
function AnimatedOutlet() {
  const location = useLocation()
  const index = ROUTE_ORDER[location.pathname] ?? 0
  const prevIndexRef = useRef(index)
  const delta = index - prevIndexRef.current
  const dx = delta === 0 ? 0 : delta > 0 ? 22 : -22

  useEffect(() => {
    prevIndexRef.current = index
  }, [index])

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0.3, x: dx, y: dx === 0 ? 10 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0, transition: EASE_PAGE }}
    >
      <Outlet />
    </motion.div>
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
