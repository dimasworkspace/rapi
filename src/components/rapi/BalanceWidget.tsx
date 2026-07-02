import { ArrowDown, ArrowUp } from 'lucide-react'
import { formatRupiah } from '@/lib/formatters'
import { useCountUp } from '@/lib/useCountUp'

interface BalanceWidgetProps {
  balance: number
  income: number
  expense: number
}

/** Kartu saldo utama — Navy dengan glow Sunshine Yellow + saldo count-up. */
export function BalanceWidget({ balance, income, expense }: BalanceWidgetProps) {
  const animatedBalance = useCountUp(balance)

  return (
    <div className="relative overflow-hidden rounded-rapi-xl bg-gradient-to-br from-rapi-navy via-rapi-navy to-[#1E2A55] p-6 text-white shadow-rapi-elevated">
      {/* Glow Sunshine Yellow — aksen energi khas Rapi */}
      <div
        aria-hidden
        className="absolute -right-10 -top-14 h-44 w-44 rounded-full bg-rapi-yellow/30 blur-2xl"
      />
      <div aria-hidden className="absolute -right-5 -top-7 h-24 w-24 rounded-full bg-rapi-yellow/25" />
      <div
        aria-hidden
        className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-rapi-blue/50 blur-xl"
      />

      <p className="relative text-xs text-white/70">Total Saldo</p>
      <p className="relative mt-1 text-[34px] font-bold leading-tight">
        {formatRupiah(animatedBalance)}
      </p>

      <div className="relative mt-5 flex gap-2.5">
        <div className="flex-1 rounded-rapi-md bg-white/10 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] text-white/75">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/25">
              <ArrowUp size={10} className="text-emerald-300" strokeWidth={3} />
            </span>
            Pemasukan
          </p>
          <p className="mt-1 text-sm font-bold">{formatRupiah(income)}</p>
        </div>
        <div className="flex-1 rounded-rapi-md bg-white/10 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] text-white/75">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-400/25">
              <ArrowDown size={10} className="text-red-300" strokeWidth={3} />
            </span>
            Pengeluaran
          </p>
          <p className="mt-1 text-sm font-bold">{formatRupiah(expense)}</p>
        </div>
      </div>
    </div>
  )
}
