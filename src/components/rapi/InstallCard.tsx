import { useEffect, useState } from 'react'
import { Share2, Smartphone } from 'lucide-react'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { useT } from '@/lib/i18n'

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)

/** Kartu "Pasang Rapi" — tombol install (Android) atau petunjuk manual (iOS).
 *  Tugasnya cuma satu: memasang di perangkat INI. QR & salin-link sengaja
 *  dibuang — itu pekerjaan lain (buka di perangkat lain) yang cuma bikin
 *  kartunya ramai, dan QR di dalam app yang sudah kebuka itu nggak masuk akal. */
export function InstallCard() {
  const t = useT()
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone())

  // Tangkap prompt install Chrome/Android
  useEffect(() => {
    const onPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setInstallEvent(e)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallEvent(null)
  }

  return (
    <RapiCard>
      <div className="flex items-center gap-2">
        <Smartphone size={15} className="text-rapi-blue" />
        <span className="text-[13px] font-semibold text-rapi-navy dark:text-rapi-dark-ink">
          {t.settings.installTitle}
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-rapi-gray-600">{t.settings.installDesc}</p>

      {installed ? (
        <p className="mt-3 rounded-rapi-md bg-rapi-income-soft px-3 py-2.5 text-[13px] font-semibold text-rapi-income dark:bg-rapi-income/20">
          {t.settings.installedNote}
        </p>
      ) : installEvent ? (
        <RapiButton variant="accent" onClick={handleInstall} className="mt-3 w-full">
          {t.settings.installBtn}
        </RapiButton>
      ) : (
        /* Prompt otomatis belum muncul → kasih panduan manual sesuai platform,
           jangan biarin kosong (user bingung mau ngapain). */
        <p className="mt-3 rounded-rapi-md bg-rapi-gray-100 px-3 py-2.5 text-[12px] leading-relaxed text-rapi-gray-600 dark:bg-white/5">
          <Share2 size={13} className="mb-0.5 mr-1 inline" />
          {isIOS() ? t.settings.iosHint : t.settings.androidHint}
        </p>
      )}
    </RapiCard>
  )
}
