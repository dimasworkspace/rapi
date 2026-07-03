import { Outlet } from 'react-router-dom'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { BottomNav } from '@/components/layout/BottomNav'
import { AddTransactionSheet } from '@/components/rapi/AddTransactionSheet'
import { Toast } from '@/components/rapi/Toast'

/** Kerangka app: konten max-w mobile di tengah + bottom nav menempel bawah. */
export function AppLayout() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md pb-28">
      <AmbientBackground />
      <Outlet />
      <AddTransactionSheet />
      <Toast />
      <BottomNav />
    </div>
  )
}
