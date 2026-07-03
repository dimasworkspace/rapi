export interface DonutSlice {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  slices: DonutSlice[]
  size?: number
  stroke?: number
  centerTop?: string
  centerMain?: string
  centerColor?: string
}

/** Donut chart SVG murni — tanpa lib eksternal, on-brand. */
export function DonutChart({
  slices,
  size = 168,
  stroke = 24,
  centerTop,
  centerMain,
  centerColor,
}: DonutChartProps) {
  const total = slices.reduce((s, x) => s + x.value, 0)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let acc = 0

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E6ECF7" strokeWidth={stroke} />
        {total > 0 &&
          slices.map((s, i) => {
            const len = (s.value / total) * c
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-acc}
              />
            )
            acc += len
            return el
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerTop && (
          <span className="text-[11px] font-medium tracking-tight text-rapi-gray-600">
            {centerTop}
          </span>
        )}
        <span
          className="text-sm font-bold tracking-tight"
          style={{ color: centerColor ?? '#111835' }}
        >
          {centerMain}
        </span>
      </div>
    </div>
  )
}
