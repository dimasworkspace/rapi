import { format, isToday, isYesterday } from 'date-fns'
import { enUS as localeEn, id as localeId } from 'date-fns/locale'
import { useSettingsStore } from '@/store/settingsStore'

// Format Rupiah — selalu IDR, SELALU angka penuh: "Rp 2.865.000".
// Sengaja TIDAK dibulatkan jadi "Rp 2,9 jt": di app keuangan, pembulatan
// menyembunyikan selisih ratusan ribu dan bikin user nggak percaya angkanya.
export const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

/** Versi ringkas untuk ruang sempit (label grafik). Lossless: cuma memadatkan
 *  angka bulat, kalau ada sisa tetap tampil penuh. */
export const formatRupiahShort = (amount: number): string => {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000 && abs % 1_000_000 === 0) return `Rp ${abs / 1_000_000} jt`
  if (abs >= 1_000 && abs % 1_000 === 0) return `Rp ${(abs / 1_000).toLocaleString('id-ID')} rb`
  return formatRupiah(abs)
}

// Nominal bertanda untuk list transaksi: "-Rp 45.000" / "+Rp 3.800.000".
export const formatRupiahSigned = (
  amount: number,
  type: 'income' | 'expense',
): string => `${type === 'income' ? '+' : '-'}${formatRupiah(Math.abs(amount))}`

// Label hari untuk pengelompokan list transaksi — ikut bahasa aktif.
export const formatDayLabel = (isoDate: string): string => {
  const en = useSettingsStore.getState().lang === 'en'
  const d = new Date(isoDate)
  if (isToday(d)) return en ? 'Today' : 'Hari Ini'
  if (isYesterday(d)) return en ? 'Yesterday' : 'Kemarin'
  return format(d, 'd MMMM yyyy', { locale: en ? localeEn : localeId })
}
