import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
    (set) => ({
      profile: null,
      onboarded: false,
      completeOnboarding: (name, initialBalance) =>
        set({
          onboarded: true,
          profile: { name: name.trim(), initialBalance, createdAt: new Date().toISOString() },
        }),
      updateName: (name) =>
        set((s) => (s.profile ? { profile: { ...s.profile, name: name.trim() } } : s)),
      setInitialBalance: (amount) =>
        set((s) => (s.profile ? { profile: { ...s.profile, initialBalance: amount } } : s)),
    }),
    { name: 'rapi-user' },
  ),
)
