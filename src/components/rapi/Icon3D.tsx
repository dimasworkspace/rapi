import { useState } from 'react'

// Fluent Emoji 3D (Microsoft, MIT) via jsDelivr — semua URL diverifikasi 200 OK.
const CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets'

const ICON_PATHS: Record<string, string> = {
  // Kategori pengeluaran
  makanan: 'Steaming bowl/3D/steaming_bowl_3d.png',
  transportasi: 'Automobile/3D/automobile_3d.png',
  belanja: 'Shopping bags/3D/shopping_bags_3d.png',
  hiburan: 'Video game/3D/video_game_3d.png',
  tagihan: 'Satellite antenna/3D/satellite_antenna_3d.png',
  kesehatan: 'Pill/3D/pill_3d.png',
  pendidikan: 'Books/3D/books_3d.png',
  'lainnya-keluar': 'Wrapped gift/3D/wrapped_gift_3d.png',
  // Kategori pemasukan
  gaji: 'Briefcase/3D/briefcase_3d.png',
  freelance: 'Laptop/3D/laptop_3d.png',
  bonus: 'Party popper/3D/party_popper_3d.png',
  'lainnya-masuk': 'Money bag/3D/money_bag_3d.png',
  // UI
  fire: 'Fire/3D/fire_3d.png',
  zap: 'High voltage/3D/high_voltage_3d.png',
  sparkles: 'Sparkles/3D/sparkles_3d.png',
  invest: 'Chart increasing/3D/chart_increasing_3d.png',
  report: 'Bar chart/3D/bar_chart_3d.png',
  wave: 'Waving hand/Default/3D/waving_hand_3d_default.png',
  robot: 'Robot/3D/robot_3d.png',
  gear: 'Gear/3D/gear_3d.png',
  compass: 'Compass/3D/compass_3d.png',
  memo: 'Memo/3D/memo_3d.png',
  rocket: 'Rocket/3D/rocket_3d.png',
  party: 'Party popper/3D/party_popper_3d.png',
  // Tipe aset investasi
  investasi: 'Chart increasing/3D/chart_increasing_3d.png',
  saham: 'Chart increasing/3D/chart_increasing_3d.png',
  reksadana: 'Bank/3D/bank_3d.png',
  kripto: 'Coin/3D/coin_3d.png',
  emas: 'Gem stone/3D/gem_stone_3d.png',
  deposito: 'Money with wings/3D/money_with_wings_3d.png',
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
  const [failed, setFailed] = useState(false)
  const path = ICON_PATHS[name]

  if (!path || failed) {
    return (
      <span className={className} style={{ fontSize: size * 0.82, lineHeight: 1 }} aria-hidden>
        {fallback}
      </span>
    )
  }

  return (
    <img
      src={`${CDN}/${encodeURI(path)}`}
      width={size}
      height={size}
      alt=""
      aria-hidden
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
      style={{ filter: 'drop-shadow(0 2px 3px rgba(17,24,53,0.18))' }}
    />
  )
}
