import { useState } from 'react'
import { RapiButton } from '@/components/rapi/RapiButton'
import { useUserStore } from '@/store/userStore'

/** First-run tanpa login: sapa → nama panggilan → saldo awal opsional → dashboard. */
export default function Onboarding() {
  const completeOnboarding = useUserStore((s) => s.completeOnboarding)
  const [name, setName] = useState('')
  const [balanceInput, setBalanceInput] = useState('')

  const balanceDigits = balanceInput.replace(/\D/g, '')
  const displayBalance = balanceDigits
    ? new Intl.NumberFormat('id-ID').format(parseInt(balanceDigits, 10))
    : ''

  const handleStart = () => {
    if (!name.trim()) return
    completeOnboarding(name, balanceDigits ? parseInt(balanceDigits, 10) : 0)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <div className="relative flex flex-col items-center justify-center overflow-hidden bg-rapi-navy px-6 pb-14 pt-20 text-center text-white">
        <div
          aria-hidden
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rapi-yellow/15"
        />
        <div
          aria-hidden
          className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-rapi-blue/30"
        />
        <span className="relative text-5xl">👋</span>
        <h1 className="relative mt-4 text-3xl font-bold">Halo! Aku Rapi</h1>
        <p className="relative mt-2 max-w-xs text-sm leading-relaxed text-white/75">
          Teman kamu buat catat keuangan tanpa ribet — ketik, ngomong, atau foto struk,
          langsung rapi. ✨
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-6 py-8">
        <div>
          <label htmlFor="ob-name" className="mb-1.5 block text-xs font-bold text-rapi-gray-600">
            Panggil kamu siapa?
          </label>
          <input
            id="ob-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="Nama panggilanmu"
            autoFocus
            maxLength={30}
            className="w-full rounded-rapi-md border-[1.5px] border-rapi-gray-300 bg-white px-4 py-3.5 text-sm outline-none transition-colors focus:border-rapi-blue"
          />
        </div>

        <div>
          <label
            htmlFor="ob-balance"
            className="mb-1.5 block text-xs font-bold text-rapi-gray-600"
          >
            Saldo kamu sekarang — boleh dikosongin kok 😉
          </label>
          <div className="flex items-center rounded-rapi-md border-[1.5px] border-rapi-gray-300 bg-white transition-colors focus-within:border-rapi-blue">
            <span className="pl-4 text-sm font-bold text-rapi-gray-600">Rp</span>
            <input
              id="ob-balance"
              value={displayBalance}
              onChange={(e) => setBalanceInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              placeholder="0"
              inputMode="numeric"
              className="w-full bg-transparent px-2 py-3.5 text-sm outline-none"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-rapi-gray-600">
            Biar total saldomu langsung akurat. Bisa diubah kapan aja di Profil.
          </p>
        </div>

        <RapiButton
          variant="accent"
          onClick={handleStart}
          disabled={!name.trim()}
          className="mt-auto w-full text-base"
        >
          Mulai #RapiinAja 🚀
        </RapiButton>
      </div>
    </div>
  )
}
