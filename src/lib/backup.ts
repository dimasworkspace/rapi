// Backup & restore data Rapi — semua store LocalStorage jadi satu file JSON.
// API key SENGAJA tidak diekspor (biar file backup nggak bocorin rahasia).

const STORE_KEYS = [
  'rapi-user',
  'rapi-transactions',
  'rapi-categories',
  'rapi-investments',
  'rapi-ai',
  'rapi-settings',
] as const

interface BackupFile {
  app: 'rapi'
  version: number
  exportedAt: string
  data: Record<string, unknown>
}

/** Kumpulkan semua store → unduh sebagai file JSON. API key dibuang. */
export function exportData(): void {
  const data: Record<string, unknown> = {}
  for (const key of STORE_KEYS) {
    const raw = localStorage.getItem(key)
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw)
      // Buang API key dari backup — jangan simpan rahasia di file
      if (key === 'rapi-ai' && parsed?.state) parsed.state = { ...parsed.state, apiKey: '' }
      data[key] = parsed
    } catch {
      /* skip entri rusak */
    }
  }

  const payload: BackupFile = {
    app: 'rapi',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rapi-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Baca file backup → tulis balik ke LocalStorage. Return true kalau sukses. */
export async function importData(file: File): Promise<boolean> {
  try {
    const text = await file.text()
    const payload = JSON.parse(text) as BackupFile
    if (payload?.app !== 'rapi' || typeof payload.data !== 'object') return false

    for (const key of STORE_KEYS) {
      if (payload.data[key] !== undefined) {
        localStorage.setItem(key, JSON.stringify(payload.data[key]))
      }
    }
    return true
  } catch {
    return false
  }
}
