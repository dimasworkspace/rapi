// Palet segmen chart — keluarga biru–navy Rapi biar cohesive & on-brand
// (bukan warna acak di luar guidelines). Dipakai untuk donut kategori.
export const CATEGORY_COLORS = [
  '#0248C1', // rapi-blue
  '#1E5BD6',
  '#4F86E8',
  '#7FA6EE',
  '#A9C4F5',
  '#2D3A66',
  '#111835', // navy
  '#5B6478', // gray-600
]

export const colorForIndex = (i: number): string =>
  CATEGORY_COLORS[i % CATEGORY_COLORS.length]
