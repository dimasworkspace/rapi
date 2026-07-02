import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi 👋'
  if (h < 15) return 'Selamat siang ☀️'
  if (h < 18) return 'Selamat sore 🌤️'
  return 'Selamat malam 🌙'
}

interface TopBarProps {
  /** Mode judul — untuk halaman selain dashboard. */
  title?: string
  /** Tampilkan tombol kembali (untuk halaman di luar tab utama). */
  showBack?: boolean
  /** Mode sapaan — untuk dashboard. */
  greetingName?: string
}

export function TopBar({ title, showBack = false, greetingName }: TopBarProps) {
  const navigate = useNavigate()

  if (greetingName) {
    return (
      <header className="flex items-center justify-between py-4">
        <div>
          <p className="text-xs text-rapi-gray-600">{getGreeting()}</p>
          <p className="mt-0.5 text-lg font-bold">Halo, {greetingName}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rapi-yellow font-bold text-rapi-navy">
          {greetingName.charAt(0).toUpperCase()}
        </div>
      </header>
    )
  }

  return (
    <header className="flex items-center gap-2 py-4">
      {showBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-rapi-navy transition-colors hover:bg-rapi-gray-100"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <h1 className="text-lg font-bold">{title}</h1>
    </header>
  )
}
