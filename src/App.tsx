import { useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RapiMascot } from '@/components/rapi/RapiMascot'
import { useT } from '@/lib/i18n'
import { isSupabaseConfigured } from '@/lib/supabase'
import { registerSync, setSyncErrorHandler, syncOnLogin } from '@/lib/sync'
import AIChat from '@/pages/AIChat'
import ComingSoon from '@/pages/ComingSoon'
import Dashboard from '@/pages/Dashboard'
import Investments from '@/pages/Investments'
import Login from '@/pages/Login'
import Onboarding from '@/pages/Onboarding'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'
import Transactions from '@/pages/Transactions'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { useUserStore } from '@/store/userStore'

// Hubungkan store ke server sekali saja, saat modul dimuat
registerSync()

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
  const showToast = useUiStore((s) => s.showToast)

  const [syncing, setSyncing] = useState(false)
  const syncedFor = useRef<string | null>(null)

  // Cek sesi tersimpan + pasang pelapor error sync
  useEffect(() => {
    initAuth()
    setSyncErrorHandler((label) => showToast(`Gagal ${label} ke server 😕`))
  }, [initAuth, showToast])

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
  if (isSupabaseConfigured) {
    if (authLoading) return <Splash />
    if (!user) return <Login />
    if (syncing) return <Splash />
  }

  // Profil belum lengkap (akun baru / mode lokal) → onboarding
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
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  )
}
