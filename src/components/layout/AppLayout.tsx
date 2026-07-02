import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { Toast } from '@/components/rapi/Toast'

/** Kerangka app: konten max-w mobile di tengah + bottom nav menempel bawah. */
export function AppLayout() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md pb-28">
      <Outlet />
      <Toast />
      <BottomNav />
    </div>
  )
}
