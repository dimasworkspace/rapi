import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { AddInvestmentSheet } from '@/components/rapi/AddInvestmentSheet'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { formatRupiah } from '@/lib/formatters'
import { useT } from '@/lib/i18n'
import { useCountUp } from '@/lib/useCountUp'
import { cn } from '@/lib/utils'
import { assetStats, useInvestmentStore } from '@/store/investmentStore'
import { useUiStore } from '@/store/uiStore'
import { ASSET_TYPES } from '@/types'

const typeMeta = (id: string) => ASSET_TYPES.find((a) => a.id === id)

export default function Investments() {
  const t = useT()
  const showConfirm = useUiStore((s) => s.showConfirm)
  const assets = useInvestmentStore((s) => s.assets)
  const removeAsset = useInvestmentStore((s) => s.removeAsset)
  const [addOpen, setAddOpen] = useState(false)

  const { totalValue, totalModal, totalPL, totalPct, rows, maxAbsPct } = useMemo(() => {
    let value = 0
    let modal = 0
    const rows = assets.map((a) => {
      const st = assetStats(a)
      value += st.value
      modal += st.modal
      return { asset: a, ...st }
    })
    const pl = value - modal
    const maxAbsPct = Math.max(1, ...rows.map((r) => Math.abs(r.plPct)))
    return {
      totalValue: value,
      totalModal: modal,
      totalPL: pl,
      totalPct: modal > 0 ? (pl / modal) * 100 : 0,
      rows,
      maxAbsPct,
    }
  }, [assets])

  const animatedTotal = useCountUp(totalValue)

  return (
    <PageWrapper>
      <TopBar title={t.investments.title} />

      {assets.length === 0 ? (
        <RapiCard className="mt-5 flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Icon3D name="saham" size={52} fallback="📈" />
          <p className="text-[13px] leading-relaxed text-rapi-gray-600">{t.investments.empty}</p>
          <RapiButton variant="accent" onClick={() => setAddOpen(true)}>
            {t.investments.emptyCta}
          </RapiButton>
        </RapiCard>
      ) : (
        <>
          {/* Ringkasan portofolio — navy hero mini, senada hero dashboard */}
          <div className="animate-rapi-slide-down relative mt-1 overflow-hidden rounded-rapi-xl bg-gradient-to-br from-rapi-navy via-[#17265e] to-[#0a3db2] p-5 text-white shadow-rapi-elevated">
            <div
              aria-hidden
              className="absolute -bottom-14 right-0 h-40 w-40 rounded-full bg-rapi-blue/40 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-rapi-yellow/20 blur-2xl"
            />
            <p className="relative text-[11px] font-medium uppercase tracking-wide text-white/60">
              {t.investments.totalValue}
            </p>
            <p className="tabular-nums relative mt-1 text-[30px] font-bold leading-none tracking-tight">
              {formatRupiah(animatedTotal)}
            </p>
            <div className="relative mt-3 flex items-center gap-2">
              <span
                className="tabular-nums rounded-full px-2.5 py-1 text-[13px] font-semibold"
                style={{
                  background: totalPL >= 0 ? 'rgba(22,163,74,0.22)' : 'rgba(239,68,68,0.22)',
                  color: totalPL >= 0 ? '#86EFAC' : '#FCA5A5',
                }}
              >
                {totalPL >= 0 ? '↑' : '↓'} {formatRupiah(Math.abs(totalPL))} (
                {totalPct.toFixed(1).replace('.', ',')}%)
              </span>
              <span className="text-[11px] text-white/50">
                {t.investments.capital} {formatRupiah(totalModal)}
              </span>
            </div>
          </div>

          {/* Pertumbuhan tiap aset — bar diverging dari titik nol */}
          <RapiCard className="animate-rapi-fade-up mt-4" style={{ animationDelay: '120ms' }}>
            <h2 className="mb-3 text-[13px] font-semibold tracking-tight dark:text-rapi-dark-ink">
              {t.investments.growth}
            </h2>
            <div className="flex flex-col gap-3.5">
              {rows.map(({ asset, plPct }) => {
                const up = plPct >= 0
                const w = (Math.abs(plPct) / maxAbsPct) * 50
                return (
                  <div key={asset.id}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[13px] font-medium text-rapi-navy dark:text-rapi-dark-ink">
                        <Icon3D name={asset.type} size={16} fallback={typeMeta(asset.type)?.emoji ?? '📈'} />
                        {asset.name}
                      </span>
                      <span
                        className={cn(
                          'tabular-nums text-[13px] font-semibold',
                          up ? 'text-rapi-income' : 'text-rapi-expense',
                        )}
                      >
                        {up ? '+' : '−'}
                        {Math.abs(plPct).toFixed(1).replace('.', ',')}%
                      </span>
                    </div>
                    {/* Track dengan titik nol di tengah — bar tumbuh dari nol (scaleX, hemat layout) */}
                    <div className="relative h-2 rounded-full bg-rapi-gray-100 dark:bg-white/10">
                      <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-rapi-gray-300 dark:bg-white/20" />
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                          'absolute top-0 h-2',
                          up
                            ? 'left-1/2 origin-left rounded-r-full bg-rapi-income'
                            : 'origin-right rounded-l-full bg-rapi-expense',
                        )}
                        style={up ? { width: `${w}%` } : { right: '50%', width: `${w}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </RapiCard>

          {/* Daftar aset */}
          <div
            className="animate-rapi-fade-up mb-2.5 mt-6 flex items-center justify-between"
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-rapi-navy dark:text-rapi-dark-ink">
              {t.investments.list}
            </h2>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1 text-[13px] font-semibold text-rapi-blue"
            >
              <Plus size={15} />
              {t.common.add}
            </button>
          </div>

          <div
            className="animate-rapi-fade-up rapi-glass divide-y divide-rapi-gray-300/40 rounded-rapi-lg py-1"
            style={{ animationDelay: '240ms' }}
          >
            {rows.map(({ asset, value, plPct }, i) => {
              const up = plPct >= 0
              return (
                <div
                  key={asset.id}
                  className="animate-rapi-fade-up flex items-center gap-3 px-4 py-3"
                  style={{ animationDelay: `${280 + Math.min(i, 8) * 50}ms` }}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                    <Icon3D name={asset.type} size={30} fallback={typeMeta(asset.type)?.emoji ?? '📈'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-rapi-navy dark:text-rapi-dark-ink">
                      {asset.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-rapi-gray-600">
                      {typeMeta(asset.type)?.label} · {asset.units.toLocaleString('id-ID')} {t.investments.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums text-[13px] font-semibold text-rapi-navy dark:text-rapi-dark-ink">
                      {formatRupiah(value)}
                    </p>
                    <p
                      className={cn(
                        'tabular-nums text-[11px] font-semibold',
                        up ? 'text-rapi-income' : 'text-rapi-expense',
                      )}
                    >
                      {up ? '↑' : '↓'} {Math.abs(plPct).toFixed(1).replace('.', ',')}%
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showConfirm({
                        message: t.investments.confirmDelete(asset.name),
                        confirmLabel: t.common.delete,
                        danger: true,
                        onConfirm: () => removeAsset(asset.id),
                      })
                    }
                    aria-label={`${t.common.delete} ${asset.name}`}
                    className="-mr-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-rapi-gray-300 transition-colors hover:bg-rapi-expense-soft hover:text-rapi-expense"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      <AddInvestmentSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </PageWrapper>
  )
}
