export interface TrendPoint {
  label: string
  income: number
  expense: number
}

/** Bar chart tren 6 bulan — pemasukan (hijau) vs pengeluaran (merah), semantik brand. */
export function TrendChart({ data }: { data: TrendPoint[] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]))

  return (
    <div>
      <div className="flex h-32 items-end justify-between gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex h-full flex-1 items-end justify-center gap-1">
            <div
              className="w-2.5 rounded-t-full bg-rapi-income transition-[height] duration-500"
              style={{ height: `${(d.income / max) * 100}%` }}
              title={`Masuk: ${d.income}`}
            />
            <div
              className="w-2.5 rounded-t-full bg-rapi-expense transition-[height] duration-500"
              style={{ height: `${(d.expense / max) * 100}%` }}
              title={`Keluar: ${d.expense}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[10px] font-bold text-rapi-gray-600">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}
