import { format, isToday, isYesterday } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

// Format Rupiah — selalu IDR (pola wajib CLAUDE.md).
// Nominal ≥ 1 jt dipadatkan jadi "Rp X,X jt" sesuai UI kit (koma desimal id-ID).
export const formatRupiah = (amount: number): string => {
  if (amount >= 1_000_000) {
    const jt = (amount / 1_000_000).toFixed(1).replace('.', ',').replace(/,0$/, '')
    return `Rp ${jt} jt`
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Versi kompak untuk list transaksi — UI kit memakai "25rb" / "1,5 jt".
export const formatRupiahCompact = (amount: number): string => {
  if (amount >= 1_000_000) return formatRupiah(amount)
  if (amount >= 1_000) {
    const rb = (amount / 1_000).toFixed(1).replace('.', ',').replace(/,0$/, '')
    return `Rp ${rb}rb`
  }
  return `Rp ${amount}`
}

// Nominal bertanda untuk list: pengeluaran "-Rp 25rb", pemasukan "+Rp 1,5 jt".
export const formatRupiahSigned = (
  amount: number,
  type: 'income' | 'expense',
): string => `${type === 'income' ? '+' : '-'}${formatRupiahCompact(Math.abs(amount))}`

// Label hari untuk pengelompokan list transaksi.
export const formatDayLabel = (isoDate: string): string => {
  const d = new Date(isoDate)
  if (isToday(d)) return 'Hari Ini'
  if (isYesterday(d)) return 'Kemarin'
  return format(d, 'd MMMM yyyy', { locale: localeId })
}
