import { useMemo } from 'react'
import { isToday } from 'date-fns'
import { ArrowDown, ArrowUp, ChevronRight, Eye, EyeOff, MessageCircle, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { RapiMascot } from '@/components/rapi/RapiMascot'
import { TransactionItem } from '@/components/rapi/TransactionItem'
import { formatRupiah } from '@/lib/formatters'
import { type Dict, useT } from '@/lib/i18n'
import { useCountUp } from '@/lib/useCountUp'
import { useCategoryStore } from '@/store/categoryStore'
import { useSettingsStore } from '@/store/settingsStore'
import { sortByDateDesc, useTransactionStore } from '@/store/transactionStore'
import { useUiStore } from '@/store/uiStore'
import { useUserStore } from '@/store/userStore'

// Pengganti nominal saat disembunyikan. Pakai titik tebal, bukan angka acak —
// biar jelas ini disamarkan, bukan saldonya beneran segitu.
const MASKED = '•••••••'
const MASKED_SM = '••••'

// Rangkuman mingguan (7 hari terakhir). Sengaja mengangkat kategori penyedot
// terbesar, bukan mengulang total masuk/keluar — dua angka itu sudah tercetak
// di kartu tepat di atas kartu ini.
const buildWeeklySummary = (
  t: Dict,
  name: string,
  count: number,
  income: number,
  expense: number,
  topCat: { label: string; amount: number } | null,
): string => {
  if (count === 0) return t.weekly.empty(name)
  if (!topCat) return t.weekly.noExpense
  const net = income - expense
  return (
    t.weekly.topCat(topCat.label, topCat.amount) +
    (net >= 0 ? t.weekly.netLeft(net) : t.weekly.netShort(-net))
  )
}

export default function Dashboard() {
  const t = useT()
  const navigate = useNavigate()
  const openAdd = useUiStore((s) => s.openAdd)
  const profile = useUserStore((s) => s.profile)
  const transactions = useTransactionStore((s) => s.transactions)
  const categories = useCategoryStore((s) => s.categories)
  const hideBalance = useSettingsStore((s) => s.hideBalance)
  const toggleHideBalance = useSettingsStore((s) => s.toggleHideBalance)
  const name = profile?.name ?? 'Kamu'

  const { balance, monthIncome, monthExpense, recent, todayCount, weeklySummary } = useMemo(() => {
    const initial = profile?.initialBalance ?? 0
    const now = new Date()
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000
    let income = 0
    let expense = 0
    let inMonth = 0
    let outMonth = 0
    let today = 0
    let weekCount = 0
    let weekIncome = 0
    let weekExpense = 0
    const weekByCat = new Map<string, number>()

    for (const tx of transactions) {
      if (tx.type === 'income') income += tx.amount
      if (tx.type === 'expense') expense += tx.amount
      const d = new Date(tx.date)
      const sameMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      if (sameMonth && tx.type === 'income') inMonth += tx.amount
      if (sameMonth && tx.type === 'expense') outMonth += tx.amount
      if (isToday(d)) today += 1
      if (d.getTime() >= weekAgo) {
        weekCount += 1
        if (tx.type === 'income') weekIncome += tx.amount
        if (tx.type === 'expense') {
          weekExpense += tx.amount
          weekByCat.set(tx.category, (weekByCat.get(tx.category) ?? 0) + tx.amount)
        }
      }
    }

    // Kategori penyedot terbesar minggu ini — inti dari kartu rangkuman
    let topCat: { label: string; amount: number } | null = null
    for (const [catId, amount] of weekByCat) {
      if (topCat && amount <= topCat.amount) continue
      const cat = categories.find((c) => c.id === catId)
      topCat = { label: cat ? `${cat.emoji} ${cat.name}` : t.common.uncategorized, amount }
    }

    return {
      balance: initial + income - expense,
      monthIncome: inMonth,
      monthExpense: outMonth,
      recent: sortByDateDesc(transactions).slice(0, 5),
      todayCount: today,
      weeklySummary: buildWeeklySummary(t, name, weekCount, weekIncome, weekExpense, topCat),
    }
  }, [transactions, profile, name, t, categories])

  const animatedBalance = useCountUp(balance)

  return (
    <PageWrapper className="px-0">
      {/* ===== Navy canvas hero — navy diam nutup atas, konten yang turun ===== */}
      <header className="relative overflow-hidden rounded-b-[28px] bg-gradient-to-br from-rapi-navy via-[#17265e] to-[#0a3db2] px-5 pb-7 pt-8 text-white">
        <div
          aria-hidden
          className="absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-rapi-blue/40 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-rapi-yellow/20 blur-2xl"
        />

        {/* Pintu masuk Rapi AI — kanan atas hero */}
        <Link
          to="/ai"
          aria-label={t.dashboard.aiLabel}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/30 active:scale-90"
        >
          <MessageCircle size={18} />
        </Link>

        <div className="relative animate-rapi-slide-down text-center">
          <p className="text-xs text-white/60">{t.greeting(new Date().getHours())}</p>
          <p className="mt-1 text-xl font-bold">{t.dashboard.hello(name)}</p>

          {/* Label + tombol sembunyikan nominal. Tombolnya nempel di label, bukan
              di pojok layar, biar hubungannya dengan angka di bawahnya jelas. */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
              {t.dashboard.totalBalance}
            </p>
            <button
              type="button"
              onClick={toggleHideBalance}
              aria-label={hideBalance ? t.dashboard.showBalance : t.dashboard.hideBalance}
              aria-pressed={hideBalance}
              className="-my-2 flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 active:scale-90"
            >
              {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {/* Ukuran menyesuaikan lebar layar — angka penuh (mis. Rp 12.865.000) tetap muat di HP kecil */}
          <p className="tabular-nums mt-1.5 text-[clamp(1.75rem,8.5vw,2.5rem)] font-bold leading-none tracking-tight">
            {hideBalance ? MASKED : formatRupiah(animatedBalance)}
          </p>

          {/* 3 card stat glass — semua bisa diklik, muncul berurutan (aturan stagger-sequence) */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <button
              type="button"
              onClick={() => navigate('/laporan?tipe=pemasukan')}
              style={{ animationDelay: '180ms' }}
              className="animate-rapi-fade-up flex flex-col items-center rounded-rapi-md border border-emerald-300/25 bg-emerald-400/10 px-1.5 py-2.5 backdrop-blur-sm transition-all hover:bg-emerald-400/20 active:scale-[0.97]"
            >
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200/80">
                <ArrowUp size={11} strokeWidth={3} className="text-emerald-300" />
                {t.dashboard.in}
              </p>
              <p className="tabular-nums mt-1 text-[11px] font-bold leading-tight text-white">
                {hideBalance ? MASKED_SM : formatRupiah(monthIncome)}
              </p>
            </button>

            {/* Kartu tengah: kalau hari ini masih kosong, dia berhenti jadi angka
                nol yang diam dan berubah jadi ajakan satu ketukan. Ini satu-satunya
                pengingat yang app punya tanpa perlu izin notifikasi. Nadanya
                ajakan — bukan teguran, jangan bikin user merasa bersalah. */}
            <button
              type="button"
              onClick={todayCount > 0 ? () => navigate('/transaksi') : openAdd}
              style={{ animationDelay: '250ms' }}
              className={
                'animate-rapi-fade-up flex flex-col items-center justify-center rounded-rapi-md border px-2 py-2 backdrop-blur-sm transition-all active:scale-[0.97] ' +
                (todayCount > 0
                  ? 'border-white/25 bg-white/15 hover:bg-white/25'
                  : 'border-rapi-yellow/50 bg-rapi-yellow/15 hover:bg-rapi-yellow/25')
              }
            >
              {todayCount > 0 ? (
                <>
                  <p className="tabular-nums text-lg font-bold leading-none">{todayCount}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/70">
                    {t.dashboard.today}
                  </p>
                </>
              ) : (
                <>
                  <Plus size={17} strokeWidth={3} className="text-rapi-yellow" />
                  <p className="mt-1 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-white/85">
                    {t.dashboard.logToday}
                  </p>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/laporan?tipe=pengeluaran')}
              style={{ animationDelay: '320ms' }}
              className="animate-rapi-fade-up flex flex-col items-center rounded-rapi-md border border-red-300/25 bg-red-400/10 px-1.5 py-2.5 backdrop-blur-sm transition-all hover:bg-red-400/20 active:scale-[0.97]"
            >
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-red-200/80">
                <ArrowDown size={11} strokeWidth={3} className="text-red-300" />
                {t.dashboard.out}
              </p>
              <p className="tabular-nums mt-1 text-[11px] font-bold leading-tight text-white">
                {hideBalance ? MASKED_SM : formatRupiah(monthExpense)}
              </p>
            </button>
          </div>
        </div>
      </header>

      <div className="px-5">
        {/* Rangkuman keuangan mingguan — biru (senada button & FAB), diupdate otomatis */}
        <button
          type="button"
          onClick={() => navigate('/laporan')}
          className="mt-5 w-full rounded-rapi-lg bg-gradient-to-br from-rapi-blue to-[#0334A0] p-4 text-left shadow-rapi-card transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-rapi-yellow">
            {t.dashboard.weekTitle}
          </p>
          <p className="mt-1.5 text-[15px] font-semibold leading-snug text-white">{weeklySummary}</p>
        </button>

        {/* Transaksi terbaru — heading & link navy */}
        <div className="mb-2.5 mt-7 flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-rapi-navy dark:text-rapi-dark-ink">
            {t.dashboard.recent}
          </h2>
          {transactions.length > 0 && (
            <Link
              to="/transaksi"
              className="flex items-center text-xs font-bold text-rapi-navy dark:text-rapi-dark-ink"
            >
              {t.common.seeAll}
              <ChevronRight size={14} />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <RapiCard className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <RapiMascot size={110} />
            <p className="text-sm leading-relaxed text-rapi-gray-600">{t.dashboard.emptyTitle}</p>
            <RapiButton variant="accent" onClick={openAdd}>
              {t.dashboard.emptyCta}
            </RapiButton>
          </RapiCard>
        ) : (
          <div className="rapi-surface divide-y divide-rapi-gray-300/40 rounded-rapi-lg py-1">
            {recent.map((tx, i) => (
              <div
                key={tx.id}
                className="animate-rapi-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <TransactionItem transaction={tx} variant="row" />
              </div>
            ))}

            {/* Baris ini cuma muncul selama catatan masih sedikit — mengisi
                bagian bawah yang menggantung DENGAN aksi utama, bukan hiasan,
                dan hilang sendiri begitu daftarnya sudah penuh. */}
            {transactions.length < 5 && (
              <button
                type="button"
                onClick={openAdd}
                className="flex min-h-11 w-full items-center justify-center gap-1.5 px-4 py-3 text-[12px] font-bold text-rapi-blue transition-colors hover:bg-rapi-blue/5"
              >
                <Plus size={14} strokeWidth={3} />
                {t.dashboard.addMore}
              </button>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
