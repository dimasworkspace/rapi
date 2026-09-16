const ICON_EMOJI: Record<string, string> = {
  makanan: '🍜',
  transportasi: '🚗',
  belanja: '🛍️',
  hiburan: '🎮',
  tagihan: '📡',
  kesehatan: '💊',
  pendidikan: '📚',
  'lainnya-keluar': '🎁',
  gaji: '💼',
  freelance: '💻',
  bonus: '🎉',
  'lainnya-masuk': '💰',
  fire: '🔥',
  zap: '⚡',
  sparkles: '✨',
  invest: '📈',
  report: '📊',
  wave: '👋',
  robot: '🤖',
  gear: '⚙️',
  compass: '🧭',
  memo: '📝',
  rocket: '🚀',
  party: '🎉',
  investasi: '📈',
  saham: '📈',
  reksadana: '🏦',
  kripto: '🪙',
  emas: '💎',
  deposito: '💸',
}

interface Icon3DProps {
  /** Nama icon (id kategori atau nama UI). Tidak dikenal → fallback emoji. */
  name: string
  size?: number
  className?: string
  /** Emoji cadangan kalau icon 3D tidak tersedia/gagal dimuat. */
  fallback?: string
}

export function Icon3D({ name, size = 24, className, fallback = '💸' }: Icon3DProps) {
  const emoji = ICON_EMOJI[name] ?? fallback
  return (
    <span
      className={className}
      style={{ fontSize: size * 0.82, lineHeight: 1 }}
      aria-hidden
    >
      {emoji}
    </span>
  )
}
