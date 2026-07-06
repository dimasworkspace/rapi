import { motion } from 'framer-motion'

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
              // Slice "menggambar diri" dari titik mulainya masing-masing
              <motion.circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDashoffset={-acc}
                initial={{ strokeDasharray: `0 ${c}`, opacity: 0 }}
                animate={{ strokeDasharray: `${len} ${c - len}`, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
            )
            acc += len
            return el
          })}
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.4, ease: 'easeOut' }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
      >
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
      </motion.div>
    </div>
  )
}
