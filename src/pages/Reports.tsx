import { useMemo, useState } from 'react'
import { format, isSameMonth, isSameWeek, subMonths } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { useSearchParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { DonutChart } from '@/components/rapi/DonutChart'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { TrendChart, type TrendPoint } from '@/components/rapi/TrendChart'
import { colorForIndex } from '@/lib/colors'
import { formatRupiah } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { useCategoryStore } from '@/store/categoryStore'
import { useTransactionStore } from '@/store/transactionStore'
import { useUiStore } from '@/store/uiStore'

type Period = 'week' | 'month'
type Flow = 'expense' | 'income'

export default function Reports() {
  const [params] = useSearchParams()
  const transactions = useTransactionStore((s) => s.transactions)
  const categories = useCategoryStore((s) => s.categories)
  const openAdd = useUiStore((s) => s.openAdd)

  const [period, setPeriod] = useState<Period>('month')
  const [flow, setFlow] = useState<Flow>(params.get('tipe') === 'pemasukan' ? 'income' : 'expense')

  const { periodIncome, periodExpense, slices, trend, hasData } = useMemo(() => {
    const now = new Date()
    const inPeriod = (d: Date) =>
      period === 'week' ? isSameWeek(d, now, { weekStartsOn: 1 }) : isSameMonth(d, now)

    let inc = 0
    let exp = 0
    let count = 0
    const catTotals = new Map<string, number>()

    for (const tx of transactions) {
      const d = new Date(tx.date)
      if (!inPeriod(d)) continue
      count += 1
      if (tx.type === 'income') inc += tx.amount
      if (tx.type === 'expense') exp += tx.amount
      if (tx.type === flow) {
        catTotals.set(tx.category, (catTotals.get(tx.category) ?? 0) + tx.amount)
      }
    }

    const slices = [...catTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([catId, value], i) => {
        const cat = categories.find((c) => c.id === catId)
        return {
          id: catId,
          label: cat?.name ?? 'Lainnya',
          emoji: cat?.emoji ?? '💸',
          value,
          color: colorForIndex(i),
        }
      })

    const trend: TrendPoint[] = []
    for (let i = 5; i >= 0; i--) {
      const m = subMonths(now, i)
      let mi = 0
      let me = 0
      for (const tx of transactions) {
        if (!isSameMonth(new Date(tx.date), m)) continue
        if (tx.type === 'income') mi += tx.amount
        if (tx.type === 'expense') me += tx.amount
      }
      trend.push({ label: format(m, 'MMM', { locale: localeId }), income: mi, expense: me })
    }

    return { periodIncome: inc, periodExpense: exp, slices, trend, hasData: count > 0 }
  }, [transactions, categories, period, flow])

  const flowTotal = flow === 'expense' ? periodExpense : periodIncome
  const periodLabel = period === 'week' ? 'minggu ini' : 'bulan ini'

  const insight = useMemo(() => {
    if (slices.length === 0) return null
    const top = slices[0]
    const pct = flowTotal > 0 ? Math.round((top.value / flowTotal) * 100) : 0
    const flowWord = flow === 'expense' ? 'Pengeluaran' : 'Pemasukan'
    let tail = ''
    if (flow === 'expense') {
      tail =
        pct >= 50
          ? ` Lumayan gede ya, coba diatur biar makin rapi 💪`
          : ` Masih terkontrol, keren! Pertahankan ya ✨`
    } else {
      tail = ` Mantap, terus tambah pemasukanmu ya 🚀`
    }
    return `${flowWord} terbesarmu ${periodLabel} di ${top.emoji} ${top.label} — ${formatRupiah(
      top.value,
    )} (${pct}%).${tail}`
  }, [slices, flow, flowTotal, periodLabel])

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
              'flex-1 rounded-[7px] py-2 text-xs font-bold transition-colors',
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
          {/* Ringkasan pemasukan & pengeluaran */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-rapi-lg bg-rapi-income-soft p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-rapi-income">
                ↑ Pemasukan
              </p>
              <p className="mt-1 text-lg font-bold text-rapi-navy">{formatRupiah(periodIncome)}</p>
            </div>
            <div className="rounded-rapi-lg bg-rapi-expense-soft p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-rapi-expense">
                ↓ Pengeluaran
              </p>
              <p className="mt-1 text-lg font-bold text-rapi-navy">{formatRupiah(periodExpense)}</p>
            </div>
          </div>

          {/* Donut kategori */}
          <RapiCard className="mt-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold">Per Kategori</h2>
              <div className="flex rounded-full bg-rapi-gray-100 p-0.5 text-[11px] font-bold">
                {(
                  [
                    { id: 'expense', label: 'Keluar' },
                    { id: 'income', label: 'Masuk' },
                  ] as const
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFlow(id)}
                    className={cn(
                      'rounded-full px-3 py-1 transition-colors',
                      flow === id ? 'bg-white text-rapi-navy shadow-rapi-card' : 'text-rapi-gray-600',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {slices.length === 0 ? (
              <p className="py-8 text-center text-sm text-rapi-gray-600">
                Belum ada {flow === 'expense' ? 'pengeluaran' : 'pemasukan'} {periodLabel}.
              </p>
            ) : (
              <div className="flex items-center gap-4">
                <DonutChart
                  slices={slices}
                  centerTop="Total"
                  centerMain={formatRupiah(flowTotal)}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {slices.slice(0, 5).map((s) => {
                    const pct = flowTotal > 0 ? Math.round((s.value / flowTotal) * 100) : 0
                    return (
                      <div key={s.id} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: s.color }}
                        />
                        <span className="min-w-0 flex-1 truncate text-xs font-bold text-rapi-navy">
                          {s.label}
                        </span>
                        <span className="shrink-0 text-xs font-bold text-rapi-gray-600">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </RapiCard>

          {/* Insight otomatis */}
          {insight && (
            <div className="mt-4 rounded-rapi-lg bg-gradient-to-br from-rapi-blue to-[#0334A0] p-4 text-white shadow-rapi-card">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                Insight Rapi
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-snug">{insight}</p>
            </div>
          )}

          {/* Tren 6 bulan */}
          <RapiCard className="mt-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold">Tren 6 Bulan</h2>
              <div className="flex items-center gap-3 text-[10px] font-bold text-rapi-gray-600">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rapi-income" />
                  Masuk
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rapi-expense" />
                  Keluar
                </span>
              </div>
            </div>
            <TrendChart data={trend} />
          </RapiCard>
        </>
      )}
    </PageWrapper>
  )
}
