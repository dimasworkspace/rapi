import { useMemo, useState } from 'react'
import { endOfMonth, format, isSameMonth, isSameWeek, subMonths } from 'date-fns'
import { enUS as localeEn, id as localeId } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { DonutChart } from '@/components/rapi/DonutChart'
import { GrowthChart, type GrowthPoint } from '@/components/rapi/GrowthChart'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { RapiMascot } from '@/components/rapi/RapiMascot'
import { formatRupiah } from '@/lib/formatters'
import { useT } from '@/lib/i18n'
import { SPRING_POP } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/store/settingsStore'
import { useTransactionStore } from '@/store/transactionStore'
import { useUiStore } from '@/store/uiStore'
import { useUserStore } from '@/store/userStore'

type Period = 'week' | 'month'

const INCOME_GREEN = '#16A34A'
const EXPENSE_RED = '#EF4444'

export default function Reports() {
  const t = useT()
  const lang = useSettingsStore((s) => s.lang)
  const monthLocale = lang === 'en' ? localeEn : localeId
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
      growth.push({ label: format(m, 'MMM', { locale: monthLocale }), value: bal })
    }

    return { periodIncome: inc, periodExpense: exp, growth, hasData: count > 0 }
  }, [transactions, profile, period, monthOffset])

  const net = periodIncome - periodExpense
  const netStr = `${net < 0 ? '-' : ''}${formatRupiah(Math.abs(net))}`
  const periodLabel = period === 'week' ? t.reports.periodWeek : t.reports.periodMonth
  const growthDelta = growth[growth.length - 1].value - growth[0].value

  const insight = useMemo(() => {
    if (!hasData) return null
    return periodIncome >= periodExpense
      ? t.reports.insightGood(periodLabel, periodIncome, periodExpense)
      : t.reports.insightWarn(periodLabel, periodIncome, periodExpense)
  }, [hasData, periodIncome, periodExpense, periodLabel, t])

  return (
    <PageWrapper>
      <TopBar title={t.reports.title} />

      {/* Toggle periode */}
      <div className="flex rounded-rapi-md bg-white/50 p-1 backdrop-blur dark:bg-white/5">
        {(
          [
            { id: 'week', label: t.reports.weekly },
            { id: 'month', label: t.reports.monthly },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPeriod(id)}
            className={cn(
              'relative flex-1 rounded-[7px] py-2 text-[13px] font-semibold tracking-tight transition-colors',
              period === id ? 'text-white' : 'text-rapi-gray-600 hover:text-rapi-navy dark:hover:text-rapi-dark-ink',
            )}
          >
            {/* Thumb meluncur antar pilihan (aturan state-transition, jangan snap) */}
            {period === id && (
              <motion.span
                layoutId="rapi-period-thumb"
                transition={SPRING_POP}
                aria-hidden
                className="absolute inset-0 rounded-[7px] bg-rapi-blue shadow-rapi-card"
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      {!hasData ? (
        <RapiCard className="mt-5 flex flex-col items-center gap-3 px-6 py-12 text-center">
          <RapiMascot size={110} />
          <p className="text-[13px] leading-relaxed text-rapi-gray-600">
            {t.reports.emptyData(periodLabel)}
          </p>
          <RapiButton variant="accent" onClick={openAdd}>
            {t.reports.catchTx}
          </RapiButton>
        </RapiCard>
      ) : (
        <>
          {/* Donut tunggal — center, glass bulat di belakang (tanpa card) */}
          <section className="mt-7 flex flex-col items-center">
            <h2 className="text-[13px] font-semibold tracking-tight dark:text-rapi-dark-ink">
              {t.reports.incomeVsExpense}
            </h2>
            <div className="relative mt-4 flex h-52 w-52 items-center justify-center">
              <div className="rapi-glass absolute inset-0 rounded-full" aria-hidden />
              <DonutChart
                size={168}
                stroke={22}
                slices={[
                  { label: t.common.income, value: periodIncome, color: INCOME_GREEN },
                  { label: t.common.expense, value: periodExpense, color: EXPENSE_RED },
                ]}
                centerTop={t.reports.difference}
                centerMain={netStr}
                centerColor={net >= 0 ? INCOME_GREEN : EXPENSE_RED}
              />
            </div>
            <div className="mt-5 flex items-start justify-center gap-8">
              <div className="text-center">
                <p className="flex items-center justify-center gap-1.5 text-[13px] font-medium text-rapi-gray-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: INCOME_GREEN }} />
                  {t.common.income}
                </p>
                <p className="mt-0.5 text-[13px] font-semibold text-rapi-navy dark:text-rapi-dark-ink">
                  {formatRupiah(periodIncome)}
                </p>
              </div>
              <div className="text-center">
                <p className="flex items-center justify-center gap-1.5 text-[13px] font-medium text-rapi-gray-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: EXPENSE_RED }} />
                  {t.common.expense}
                </p>
                <p className="mt-0.5 text-[13px] font-semibold text-rapi-navy dark:text-rapi-dark-ink">
                  {formatRupiah(periodExpense)}
                </p>
              </div>
            </div>
          </section>

          {/* Insight otomatis */}
          {insight && (
            <div className="mt-6 rounded-rapi-lg bg-gradient-to-br from-rapi-blue to-[#0334A0] p-4 text-white shadow-rapi-card">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-rapi-yellow">
                {t.reports.insightLabel}
              </p>
              <p className="mt-1 text-[13px] font-medium leading-relaxed tracking-tight">{insight}</p>
            </div>
          )}

          {/* Pertumbuhan keuangan — saldo kumulatif, bisa digeser per bulan */}
          <RapiCard className="mt-4">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold tracking-tight dark:text-rapi-dark-ink">
                {t.reports.growth}
              </h2>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[13px] font-semibold',
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
                className="flex h-7 w-7 items-center justify-center rounded-full text-rapi-gray-600 transition-colors hover:bg-rapi-gray-100 dark:hover:bg-white/10"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[13px] font-medium text-rapi-gray-600">
                {growth[0].label} – {growth[growth.length - 1].label}
              </span>
              <button
                type="button"
                onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
                disabled={monthOffset === 0}
                aria-label="Bulan berikutnya"
                className="flex h-7 w-7 items-center justify-center rounded-full text-rapi-gray-600 transition-colors hover:bg-rapi-gray-100 disabled:opacity-30 dark:hover:bg-white/10"
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
