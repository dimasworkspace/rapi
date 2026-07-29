import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncBus } from '@/lib/syncBus'
import type { UserProfile } from '@/types'

interface UserState {
  profile: UserProfile | null
  /** Selesai onboarding = profil terisi. */
  onboarded: boolean
  completeOnboarding: (name: string, initialBalance: number) => void
  updateName: (name: string) => void
  setInitialBalance: (amount: number) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      onboarded: false,
      completeOnboarding: (name, initialBalance) => {
        set({
          onboarded: true,
          profile: { name: name.trim(), initialBalance, createdAt: new Date().toISOString() },
        })
        syncBus.profileSaved?.(name.trim(), initialBalance)
      },
      updateName: (name) => {
        set((s) => (s.profile ? { profile: { ...s.profile, name: name.trim() } } : s))
        const p = get().profile
        if (p) syncBus.profileSaved?.(p.name, p.initialBalance)
      },
      setInitialBalance: (amount) => {
        set((s) => (s.profile ? { profile: { ...s.profile, initialBalance: amount } } : s))
        const p = get().profile
        if (p) syncBus.profileSaved?.(p.name, p.initialBalance)
      },
    }),
    { name: 'rapi-user' },
  ),
)
