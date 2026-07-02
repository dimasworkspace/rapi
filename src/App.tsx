import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import ComingSoon from '@/pages/ComingSoon'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transaksi" element={<Transactions />} />
          <Route
            path="/laporan"
            element={
              <ComingSoon
                title="Laporan"
                emoji="📊"
                message="Bentar ya, grafik donat & tren pengeluaranmu lagi dirapiin. Nyusul segera! ✨"
              />
            }
          />
          <Route
            path="/ai"
            element={
              <ComingSoon
                title="Rapi AI"
                emoji="🤖"
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
                message="Detail portofolio investasimu lagi dihitung. Bentar lagi jadi! 🚀"
                showBack
              />
            }
          />
          <Route
            path="/tambah"
            element={
              <ComingSoon
                title="Tambah Transaksi"
                emoji="✍️"
                message="Form catat transaksi (ketik, ngomong, atau foto struk) hadir di update berikutnya. Yuk siap-siap #RapiinAja! 🎉"
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
