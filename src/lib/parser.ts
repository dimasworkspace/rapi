import type { TransactionType } from '@/types'

// Parser lokal Rapi — mengubah kalimat santai jadi transaksi terstruktur.
// Contoh: "makan siang 25rb" → { type: expense, amount: 25000, category: makanan }
// AI (Anthropic, BYOK) jadi fallback cerdas di Fase 3 kalau parser ini nggak yakin.

export interface ParsedTransaction {
  type: TransactionType
  amount: number | null
  category: string // category id
  note: string
  confidence: 'high' | 'medium' | 'low'
}

const UNIT_MULTIPLIERS: Record<string, number> = {
  jt: 1_000_000,
  juta: 1_000_000,
  rb: 1_000,
  ribu: 1_000,
  k: 1_000,
}

const EXPENSE_KEYWORDS: Record<string, string[]> = {
  makanan: [
    'makan', 'sarapan', 'jajan', 'snack', 'nasi', 'ayam', 'bakso', 'mie', 'seblak',
    'martabak', 'kopi', 'boba', 'es teh', 'gofood', 'grabfood', 'shopeefood', 'resto',
    'warteg', 'warung', 'cafe', 'kfc', 'mcd',
  ],
  transportasi: [
    'grab', 'gojek', 'ojol', 'ojek', 'bensin', 'pertalite', 'pertamax', 'parkir', 'tol',
    'busway', 'transjakarta', 'krl', 'kereta', 'mrt', 'lrt', 'angkot', 'taksi', 'travel', 'bus',
  ],
  belanja: [
    'belanja', 'indomaret', 'alfamart', 'shopee', 'tokopedia', 'lazada', 'tiktok shop',
    'baju', 'celana', 'sepatu', 'tas', 'skincare', 'makeup', 'struk',
  ],
  hiburan: [
    'nonton', 'bioskop', 'cgv', 'xxi', 'game', 'top up', 'topup', 'steam', 'konser',
    'karaoke', 'tiket', 'liburan', 'healing',
  ],
  tagihan: [
    'listrik', 'pln', 'pulsa', 'kuota', 'internet', 'wifi', 'netflix', 'spotify', 'youtube',
    'langganan', 'bpjs', 'asuransi', 'cicilan', 'kos', 'kontrakan', 'sewa', 'pdam', 'token',
  ],
  kesehatan: ['obat', 'dokter', 'apotek', 'vitamin', 'klinik', 'rumah sakit', 'skincheck'],
  pendidikan: ['buku', 'kursus', 'les', 'ukt', 'spp', 'seminar', 'workshop', 'sekolah', 'kampus'],
}

const INCOME_KEYWORDS: Record<string, string[]> = {
  gaji: ['gaji', 'gajian', 'salary'],
  freelance: ['freelance', 'projek', 'project', 'fee', 'honor', 'komisi'],
  bonus: ['bonus', 'thr', 'hadiah', 'menang'],
  'lainnya-masuk': ['jual', 'refund', 'cashback', 'transferan', 'dapat', 'dapet', 'terima', 'dikasih'],
}

/** Ekstrak nominal dari teks: "25rb" / "1,5jt" / "25.000" / "25000" / "makan 25" (→ 25rb). */
export function parseAmount(text: string): { amount: number | null; matched: string } {
  const t = text.toLowerCase()

  // 1) Angka + satuan: "1,5jt", "25 rb", "10k"
  const unitMatch = t.match(/(\d+(?:[.,]\d+)?)\s*(jt|juta|rb|ribu|k)\b/)
  if (unitMatch) {
    const num = parseFloat(unitMatch[1].replace(',', '.'))
    return {
      amount: Math.round(num * UNIT_MULTIPLIERS[unitMatch[2]]),
      matched: unitMatch[0],
    }
  }

  // 2) Angka dengan pemisah ribuan: "25.000", "1.500.000"
  const sepMatch = t.match(/\d{1,3}(?:\.\d{3})+/)
  if (sepMatch) {
    return { amount: parseInt(sepMatch[0].replace(/\./g, ''), 10), matched: sepMatch[0] }
  }

  // 3) Angka polos — heuristik lokal: "makan 25" maksudnya 25 ribu
  const plainMatch = t.match(/\d+/)
  if (plainMatch) {
    const n = parseInt(plainMatch[0], 10)
    return { amount: n > 0 && n < 1000 ? n * 1000 : n, matched: plainMatch[0] }
  }

  return { amount: null, matched: '' }
}

const findCategory = (
  text: string,
  keywordMap: Record<string, string[]>,
): string | null => {
  for (const [categoryId, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((kw) => text.includes(kw))) return categoryId
  }
  return null
}

const buildNote = (text: string, matchedAmount: string): string => {
  const cleaned = text
    .replace(matchedAmount, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned) return ''
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

/** Parse kalimat transaksi jadi struktur — jantung fitur input cepat Rapi. */
export function parseTransaction(input: string): ParsedTransaction {
  const text = input.toLowerCase().trim()
  const { amount, matched } = parseAmount(text)

  const incomeCategory = findCategory(text, INCOME_KEYWORDS)
  const expenseCategory = findCategory(text, EXPENSE_KEYWORDS)

  // Kata kunci pengeluaran lebih spesifik — cek income hanya kalau tidak ada match expense
  const isIncome = incomeCategory !== null && expenseCategory === null

  const category = isIncome
    ? (incomeCategory ?? 'lainnya-masuk')
    : (expenseCategory ?? 'lainnya-keluar')

  const matchedCategory = isIncome ? incomeCategory !== null : expenseCategory !== null

  let confidence: ParsedTransaction['confidence'] = 'low'
  if (amount !== null && matchedCategory) confidence = 'high'
  else if (amount !== null) confidence = 'medium'

  return {
    type: isIncome ? 'income' : 'expense',
    amount,
    category,
    note: buildNote(input.trim(), matched),
    confidence,
  }
}
