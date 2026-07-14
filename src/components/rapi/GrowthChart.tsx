import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatRupiah } from '@/lib/formatters'

export interface GrowthPoint {
  label: string
  value: number
}

/** Grafik garis pertumbuhan keuangan (saldo kumulatif per bulan) — SVG murni,
 *  garis "menggambar dirinya" saat muncul (hormat prefers-reduced-motion via MotionConfig).
 *  Tap titik → tampil nominal (aturan tooltip-on-interact). */
export function GrowthChart({ data, ariaLabel }: { data: GrowthPoint[]; ariaLabel?: string }) {
  const [active, setActive] = useState<number | null>(null)
  const W = 320
  const H = 132
  const pad = 10
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const flat = max === min // semua nilai sama (mis. user baru, saldo belum berubah)
  const range = max - min || 1
  const stepX = (W - pad * 2) / (data.length - 1 || 1)

  const pts = data.map((d, i) => ({
    x: pad + i * stepX,
    // Kalau flat, taruh garis di tengah (bukan nempel dasar biar nggak keliatan nol)
    y: flat ? H / 2 : pad + (1 - (d.value - min) / range) * (H - pad * 2),
    ...d,
  }))

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${line} L ${pts[pts.length - 1].x} ${H - pad} L ${pts[0].x} ${H - pad} Z`

  const ap = active !== null ? pts[active] : null
  const tipText = ap ? formatRupiah(ap.value) : ''
  const tipW = Math.max(48, tipText.length * 6 + 12)
  const tipX = ap ? Math.min(Math.max(ap.x - tipW / 2, 0), W - tipW) : 0
  const tipAbove = ap ? ap.y > 26 : true

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={ariaLabel ?? 'Grafik pertumbuhan keuangan'}>
        <defs>
          <linearGradient id="rapi-growth-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0248C1" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0248C1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#rapi-growth-fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="#0248C1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {pts.map((p, i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r={active === i ? 5 : 3.5}
            fill={active === i ? '#0248C1' : '#fff'}
            stroke="#0248C1"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: 0.1 + (i / Math.max(1, pts.length - 1)) * 0.7 }}
          />
        ))}
        {/* Area tap besar tiap titik (aturan touch-target-chart) */}
        {pts.map((p, i) => (
          <circle
            key={`hit-${i}`}
            cx={p.x}
            cy={p.y}
            r="14"
            fill="transparent"
            className="cursor-pointer"
            onPointerDown={() => setActive((a) => (a === i ? null : i))}
          >
            <title>{`${p.label}: ${formatRupiah(p.value)}`}</title>
          </circle>
        ))}
        {/* Tooltip nominal saat titik di-tap */}
        {ap && (
          <g style={{ pointerEvents: 'none' }}>
            <rect
              x={tipX}
              y={tipAbove ? ap.y - 24 : ap.y + 10}
              width={tipW}
              height="16"
              rx="5"
              fill="#111835"
            />
            <text
              x={tipX + tipW / 2}
              y={tipAbove ? ap.y - 13 : ap.y + 21}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill="#fff"
            >
              {tipText}
            </text>
          </g>
        )}
      </svg>
      <div className="mt-2 flex justify-between">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[11px] font-medium text-rapi-gray-600">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}
