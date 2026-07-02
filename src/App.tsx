import { formatRupiah } from '@/lib/formatters'

// Placeholder Fase 0 — memverifikasi design token & font jalan.
// Diganti dengan router + layout shell di Fase 1.
export default function App() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-rapi-xl bg-rapi-navy p-6 text-white shadow-rapi-elevated">
        <p className="text-xs opacity-70">Total Saldo</p>
        <p className="mt-1 text-3xl font-bold">{formatRupiah(4_280_000)}</p>
        <div className="mt-4 flex gap-2">
          <span className="rounded-rapi-sm bg-rapi-yellow px-3 py-1 text-xs font-bold text-rapi-navy">
            #RapiinAja
          </span>
          <span className="rounded-rapi-sm bg-rapi-blue px-3 py-1 text-xs font-bold text-white">
            Fase 0 ✓
          </span>
        </div>
        <p className="mt-4 text-sm opacity-80">
          Halo! Fondasi Rapi udah kepasang. Yuk lanjut bangun dashboard-nya 🚀
        </p>
      </div>
    </div>
  )
}
