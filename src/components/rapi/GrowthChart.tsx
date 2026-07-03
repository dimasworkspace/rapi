export interface GrowthPoint {
  label: string
  value: number
}

/** Grafik garis pertumbuhan keuangan (saldo kumulatif per bulan) — SVG murni. */
export function GrowthChart({ data }: { data: GrowthPoint[] }) {
  const W = 320
  const H = 132
  const pad = 10
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = (W - pad * 2) / (data.length - 1 || 1)

  const pts = data.map((d, i) => ({
    x: pad + i * stepX,
    y: pad + (1 - (d.value - min) / range) * (H - pad * 2),
    ...d,
  }))

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${line} L ${pts[pts.length - 1].x} ${H - pad} L ${pts[0].x} ${H - pad} Z`

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Grafik pertumbuhan keuangan">
        <defs>
          <linearGradient id="rapi-growth-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0248C1" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0248C1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#rapi-growth-fill)" />
        <path
          d={line}
          fill="none"
          stroke="#0248C1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#0248C1" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[10px] font-semibold text-rapi-gray-600">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}
