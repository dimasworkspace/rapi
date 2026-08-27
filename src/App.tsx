import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RapiMascot } from '@/components/rapi/RapiMascot'
import { useT } from '@/lib/i18n'
import { consumeLaunchIntent } from '@/lib/launchIntent'
import { isSupabaseConfigured } from '@/lib/supabase'
import { registerSync, setSyncErrorHandler, syncOnLogin } from '@/lib/sync'
import ComingSoon from '@/pages/ComingSoon'
import Login from '@/pages/Login'
import Onboarding from '@/pages/Onboarding'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { useUserStore } from '@/store/userStore'

// Hubungkan store ke server sekali saja, saat modul dimuat
registerSync()

const AIChat = lazy(() => import('@/pages/AIChat'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Investments = lazy(() => import('@/pages/Investments'))
const Reports = lazy(() => import('@/pages/Reports'))
const Settings = lazy(() => import('@/pages/Settings'))
const Transactions = lazy(() => import('@/pages/Transactions'))

function NotFound() {
  const t = useT()
  return (
    <ComingSoon
      title={t.comingSoon.notFoundTitle}
      emoji="🧭"
      icon="compass"
      message={t.comingSoon.notFoundMsg}
      showBack
    />
  )
}

/** Layar tunggu saat cek sesi / tarik data — jangan kedip ke layar login dulu. */
function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-rapi-offwhite dark:bg-rapi-dark">
      <RapiMascot size={110} />
    </div>
  )
}

export default function App() {
  const t = useT()
  const onboarded = useUserStore((s) => s.onboarded)
  const initAuth = useAuthStore((s) => s.init)
  const user = useAuthStore((s) => s.user)
  const authLoading = useAuthStore((s) => s.loading)
  const localMode = useAuthStore((s) => s.localMode)
  const showToast = useUiStore((s) => s.showToast)
  const openAdd = useUiStore((s) => s.openAdd)
  const openAddWithPhoto = useUiStore((s) => s.openAddWithPhoto)

  const [syncing, setSyncing] = useState(false)
  const syncedFor = useRef<string | null>(null)

  // Cek sesi tersimpan + pasang pelapor error sync
  useEffect(() => {
    initAuth()
    setSyncErrorHandler((label) => showToast(`Gagal ${label} ke server 😕`))
  }, [initAuth, showToast])

  // Dibuka lewat shortcut ikon atau kiriman foto struk → langsung ke form.
  // Kalau user ternyata belum login, sheet-nya menunggu sampai app kebuka penuh.
  useEffect(() => {
    void consumeLaunchIntent().then((intent) => {
      if (!intent) return
      if (intent.photo) openAddWithPhoto(intent.photo)
      else openAdd()
    })
  }, [openAdd, openAddWithPhoto])

  // Begitu user login → tarik data (atau migrasikan data lokal warisan)
  useEffect(() => {
    if (!user || syncedFor.current === user.id) return
    syncedFor.current = user.id
    setSyncing(true)
    syncOnLogin()
      .then((result) => {
        if (result === 'migrated') showToast(t.settings.migrated)
      })
      .catch(() => showToast(t.auth.errOffline))
      .finally(() => setSyncing(false))
  }, [user, showToast, t])

  // Mode backend: tunggu cek sesi, lalu wajib login
  if (isSupabaseConfigured && !localMode) {
    if (authLoading) return <Splash />
    if (!user) return <Login />
    if (syncing) return <Splash />
  }

  // Profil belum lengkap (akun baru / mode lokal) → onboarding
  if (!onboarded) return <Onboarding />

  return (
    <MotionConfig reducedMotion="user">
      {/* basename ikut base Vite ("/app/"), jadi rute internal tetap benar
          waktu app disajikan di bawah subpath, bukan di akar domain. */}
      <Suspense fallback={<Splash />}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transaksi" element={<Transactions />} />
              <Route path="/laporan" element={<Reports />} />
              <Route path="/ai" element={<AIChat />} />
              <Route path="/profil" element={<Settings />} />
              <Route path="/investasi" element={<Investments />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Suspense>
    </MotionConfig>
  )
}
