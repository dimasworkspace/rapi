import { useMemo, useState } from 'react'
import { endOfMonth, format, isSameMonth, isSameWeek, subMonths } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { DonutChart } from '@/components/rapi/DonutChart'
import { GrowthChart, type GrowthPoint } from '@/components/rapi/GrowthChart'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { formatRupiah } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { useTransactionStore } from '@/store/transactionStore'
import { useUiStore } from '@/store/uiStore'
import { useUserStore } from '@/store/userStore'

type Period = 'week' | 'month'

const INCOME_GREEN = '#16A34A'
const EXPENSE_RED = '#EF4444'

export default function Reports() {
  const transactions = useTransactionStore((s) => s.transactions)
  const profile = useUserStore((s) => s.profile)
  const openAdd = useUiStore((s) => s.openAdd)

  const [period, setPeriod] = useState<Period>('month')
  const [monthOffset, setMonthOffset] = useState(0)

  const { periodIncome, periodExpense, growth, hasData } = useMemo(() => {
    const now = new Date()
    const inPeriod = (d: Date) =>
      period === 'week' ? isSameWeek(d, now, { weekStartsOn: 1 }) : isSameMonth(d, now)

    let inc = 0
    let exp = 0
    let count = 0
    for (const tx of transactions) {
      const d = new Date(tx.date)
      if (!inPeriod(d)) continue
      count += 1
      if (tx.type === 'income') inc += tx.amount
      if (tx.type === 'expense') exp += tx.amount
    }

    // Saldo kumulatif per bulan (pertumbuhan keuangan) — jendela bisa digeser
    const initial = profile?.initialBalance ?? 0
    const trendEnd = subMonths(now, monthOffset)
    const growth: GrowthPoint[] = []
    for (let i = 5; i >= 0; i--) {
      const m = subMonths(trendEnd, i)
      const end = endOfMonth(m).getTime()
      let bal = initial
      for (const tx of transactions) {
        if (new Date(tx.date).getTime() > end) continue
        if (tx.type === 'income') bal += tx.amount
        if (tx.type === 'expense') bal -= tx.amount
      }
      growth.push({ label: format(m, 'MMM', { locale: localeId }), value: bal })
    }

    return { periodIncome: inc, periodExpense: exp, growth, hasData: count > 0 }
  }, [transactions, profile, period, monthOffset])

  const net = periodIncome - periodExpense
  const netStr = `${net < 0 ? '-' : ''}${formatRupiah(Math.abs(net))}`
  const periodLabel = period === 'week' ? 'minggu ini' : 'bulan ini'
  const growthDelta = growth[growth.length - 1].value - growth[0].value

  const insight = useMemo(() => {
    if (!hasData) return null
    if (periodIncome >= periodExpense) {
      return `Keren! ${periodLabel} pemasukanmu ${formatRupiah(
        periodIncome,
      )}, lebih gede dari pengeluaran ${formatRupiah(periodExpense)}. Keuanganmu lagi tumbuh sehat 🌱`
    }
    return `Hati-hati ya, ${periodLabel} pengeluaranmu ${formatRupiah(
      periodExpense,
    )} lebih besar dari pemasukan ${formatRupiah(periodIncome)}. Yuk rem dikit biar tetap rapi 💪`
  }, [hasData, periodIncome, periodExpense, periodLabel])

  return (
    <PageWrapper>
      <TopBar title="Laporan" />

      {/* Toggle periode */}
      <div className="flex rounded-rapi-md bg-rapi-gray-100 p-1">
        {(
          [
            { id: 'week', label: 'Mingguan' },
            { id: 'month', label: 'Bulanan' },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPeriod(id)}
            className={cn(
              'flex-1 rounded-[7px] py-2 text-xs font-semibold transition-colors',
              period === id ? 'bg-rapi-blue text-white shadow-rapi-card' : 'text-rapi-gray-600',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {!hasData ? (
        <RapiCard className="mt-5 flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Icon3D name="report" size={52} fallback="📊" />
          <p className="text-sm leading-relaxed text-rapi-gray-600">
            Belum ada data {periodLabel} nih. Yuk catat transaksimu dulu! 🎉
          </p>
          <RapiButton variant="accent" onClick={openAdd}>
            Catat Transaksi ✍️
          </RapiButton>
        </RapiCard>
      ) : (
        <>
          {/* Donut tunggal: Pemasukan vs Pengeluaran + selisih di tengah */}
          <RapiCard className="mt-4">
            <h2 className="mb-3 text-sm font-semibold">Pemasukan vs Pengeluaran</h2>
            <div className="flex items-center gap-4">
              <DonutChart
                slices={[
                  { label: 'Pemasukan', value: periodIncome, color: INCOME_GREEN },
                  { label: 'Pengeluaran', value: periodExpense, color: EXPENSE_RED },
                ]}
                centerTop="Selisih"
                centerMain={netStr}
                centerColor={net >= 0 ? INCOME_GREEN : EXPENSE_RED}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-medium text-rapi-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: INCOME_GREEN }} />
                    Pemasukan
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-rapi-navy">
                    {formatRupiah(periodIncome)}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-medium text-rapi-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: EXPENSE_RED }} />
                    Pengeluaran
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-rapi-navy">
                    {formatRupiah(periodExpense)}
                  </p>
                </div>
              </div>
            </div>
          </RapiCard>

          {/* Insight otomatis */}
          {insight && (
            <div className="mt-4 rounded-rapi-lg bg-gradient-to-br from-rapi-blue to-[#0334A0] p-4 text-white shadow-rapi-card">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">
                Insight Rapi
              </p>
              <p className="mt-1.5 text-sm font-medium leading-relaxed">{insight}</p>
            </div>
          )}

          {/* Pertumbuhan keuangan — saldo kumulatif, bisa digeser per bulan */}
          <RapiCard className="mt-4">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Pertumbuhan Keuangan</h2>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  growthDelta >= 0
                    ? 'bg-rapi-income-soft text-rapi-income'
                    : 'bg-rapi-expense-soft text-rapi-expense',
                )}
              >
                {growthDelta >= 0 ? '↑ ' : '↓ '}
                {formatRupiah(Math.abs(growthDelta))}
              </span>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMonthOffset((o) => o + 1)}
                aria-label="Bulan sebelumnya"
                className="flex h-7 w-7 items-center justify-center rounded-full text-rapi-gray-600 transition-colors hover:bg-rapi-gray-100"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[11px] font-medium text-rapi-gray-600">
                {growth[0].label} – {growth[growth.length - 1].label}
              </span>
              <button
                type="button"
                onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
                disabled={monthOffset === 0}
                aria-label="Bulan berikutnya"
                className="flex h-7 w-7 items-center justify-center rounded-full text-rapi-gray-600 transition-colors hover:bg-rapi-gray-100 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <GrowthChart data={growth} />
          </RapiCard>
        </>
      )}
    </PageWrapper>
  )
}
