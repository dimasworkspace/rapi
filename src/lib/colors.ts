// Palet segmen donut — mengikuti warna semantik Rapi:
// pemasukan = keluarga HIJAU, pengeluaran = keluarga MERAH.
// Gradasi shade biar antar kategori tetap kebedain, tapi tetap on-brand.

const EXPENSE_COLORS = [
  '#EF4444',
  '#DC2626',
  '#F87171',
  '#B91C1C',
  '#FCA5A5',
  '#991B1B',
  '#F4B0B0',
  '#5B6478',
]

const INCOME_COLORS = [
  '#16A34A',
  '#15803D',
  '#22C55E',
  '#107A38',
  '#4ADE80',
  '#0E5A2B',
  '#9EE7BC',
  '#5B6478',
]

/** Warna segmen ke-i sesuai arus dana (income → hijau, expense → merah). */
export const colorForFlow = (flow: 'income' | 'expense', i: number): string => {
  const palette = flow === 'income' ? INCOME_COLORS : EXPENSE_COLORS
  return palette[i % palette.length]
}
