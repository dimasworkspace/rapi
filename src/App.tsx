import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import ComingSoon from '@/pages/ComingSoon'
import Dashboard from '@/pages/Dashboard'
import Onboarding from '@/pages/Onboarding'
import Reports from '@/pages/Reports'
import Transactions from '@/pages/Transactions'
import { useUserStore } from '@/store/userStore'

export default function App() {
  const onboarded = useUserStore((s) => s.onboarded)

  if (!onboarded) return <Onboarding />

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transaksi" element={<Transactions />} />
          <Route path="/laporan" element={<Reports />} />
          <Route
            path="/ai"
            element={
              <ComingSoon
                title="Rapi AI"
                emoji="🤖"
                icon="robot"
                message="Rapi AI bentar lagi siap nemenin kamu ngobrolin keuangan. Sabar ya! 😉"
              />
            }
          />
          <Route
            path="/profil"
            element={
              <ComingSoon
                title="Profil"
                emoji="⚙️"
                icon="gear"
                message="Pengaturan profil & preferensi kamu lagi disiapin. Nyusul segera! 🙌"
              />
            }
          />
          <Route
            path="/investasi"
            element={
              <ComingSoon
                title="Investasi"
                emoji="📈"
                icon="invest"
                message="Detail portofolio investasimu lagi dihitung. Bentar lagi jadi! 🚀"
                showBack
              />
            }
          />
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
  )
}
