import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import AIChat from '@/pages/AIChat'
import ComingSoon from '@/pages/ComingSoon'
import Dashboard from '@/pages/Dashboard'
import Investments from '@/pages/Investments'
import Onboarding from '@/pages/Onboarding'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'
import Transactions from '@/pages/Transactions'
import { useUserStore } from '@/store/userStore'

export default function App() {
  const onboarded = useUserStore((s) => s.onboarded)

  if (!onboarded) return <Onboarding />

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transaksi" element={<Transactions />} />
          <Route path="/laporan" element={<Reports />} />
          <Route path="/ai" element={<AIChat />} />
          <Route path="/profil" element={<Settings />} />
          <Route path="/investasi" element={<Investments />} />
          <Route
            path="*"
            element={
              <ComingSoon
                title="Halaman Nggak Ketemu"
                emoji="🧭"
                icon="compass"
                message="Waduh, halaman ini nggak ada. Yuk balik ke beranda! 😊"
                showBack
              />
            }
          />
        </Route>
      </Routes>
      </BrowserRouter>
    </MotionConfig>
  )
}
