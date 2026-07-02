import { formatRupiah } from '@/lib/formatters'

interface BalanceWidgetProps {
  balance: number
  income: number
  expense: number
}

/** Kartu saldo utama — Navy radius-xl dengan aksen lingkaran Yellow, sesuai UI kit. */
export function BalanceWidget({ balance, income, expense }: BalanceWidgetProps) {
  return (
    <div className="relative overflow-hidden rounded-rapi-xl bg-rapi-navy p-6 text-white shadow-rapi-card">
      <div
        aria-hidden
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rapi-yellow/15"
      />
      <p className="relative text-xs text-white/70">Total Saldo</p>
      <p className="relative mt-1 text-3xl font-bold">{formatRupiah(balance)}</p>
      <div className="relative mt-5 flex gap-2.5">
        <div className="flex-1 rounded-rapi-md bg-white/10 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] text-white/75">
            <span className="h-1.5 w-1.5 rounded-full bg-rapi-income" />
            Pemasukan
          </p>
          <p className="mt-0.5 text-sm font-bold">{formatRupiah(income)}</p>
        </div>
        <div className="flex-1 rounded-rapi-md bg-white/10 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] text-white/75">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F87171]" />
            Pengeluaran
          </p>
          <p className="mt-0.5 text-sm font-bold">{formatRupiah(expense)}</p>
        </div>
      </div>
    </div>
  )
}
