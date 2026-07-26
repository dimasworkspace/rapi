import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, Share2, Smartphone } from 'lucide-react'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { useT } from '@/lib/i18n'
import { useUiStore } from '@/store/uiStore'

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)

/** Kartu "Pasang Rapi" — tombol install (Android), petunjuk (iOS), QR + salin link.
 *  QR digenerate lokal (lib qrcode) biar CSP-safe, nggak lewat layanan luar. */
export function InstallCard() {
  const t = useT()
  const showToast = useUiStore((s) => s.showToast)
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone())
  const [qr, setQr] = useState('')

  const appUrl = window.location.origin

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

  // QR ke URL app — dibuat lokal, warna brand
  useEffect(() => {
    QRCode.toDataURL(appUrl, {
      width: 480,
      margin: 1,
      color: { dark: '#111835', light: '#FFFFFF' },
    })
      .then(setQr)
      .catch(() => setQr(''))
  }, [appUrl])

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallEvent(null)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(appUrl)
      showToast(t.settings.linkCopied)
    } catch {
      /* clipboard bisa ditolak — nggak fatal */
    }
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

      {/* QR + salin link — buat dibagikan / dibuka dari HP */}
      {qr && (
        <div className="mt-4 flex items-center gap-3.5">
          <img
            src={qr}
            alt={appUrl}
            width={112}
            height={112}
            className="h-28 w-28 shrink-0 rounded-rapi-md border border-rapi-gray-300/60 bg-white p-1.5 dark:border-white/10"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] leading-relaxed text-rapi-gray-600">{t.settings.qrHint}</p>
            <p className="mt-1 truncate text-[12px] font-semibold text-rapi-blue">{appUrl}</p>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-rapi-sm bg-rapi-gray-100 px-3 text-[12px] font-bold text-rapi-navy transition-transform active:scale-95 dark:bg-white/10 dark:text-rapi-dark-ink"
            >
              <Copy size={13} />
              {t.settings.copyLink}
            </button>
          </div>
        </div>
      )}
    </RapiCard>
  )
}
