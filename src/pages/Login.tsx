import { useState } from 'react'
import { AuthError } from '@supabase/supabase-js'
import { Eye, EyeOff, Loader2, Mail, WifiOff } from 'lucide-react'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiMascot } from '@/components/rapi/RapiMascot'
import { type Dict, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const INPUT =
  'w-full rounded-rapi-md border-[1.5px] border-rapi-gray-300 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-rapi-blue dark:border-white/10 dark:bg-white/5 dark:text-rapi-dark-ink'

/** Ubah error mentah Supabase jadi pesan ramah ala Rapi. */
const friendlyError = (e: unknown, t: Dict): string => {
  if (e instanceof Error && /fetch|network|timeout|abort|offline/i.test(e.message)) {
    return t.auth.errOffline
  }
  if (e instanceof AuthError) {
    const m = e.message.toLowerCase()
    if (m.includes('invalid login')) return t.auth.errWrong
    if (m.includes('already registered') || m.includes('already been registered'))
      return t.auth.errEmailUsed
    if (m.includes('at least 6') || m.includes('password should be'))
      return t.auth.errShortPassword
  }
  return t.auth.errGeneric
}

/** Logo Google resmi (SVG multiwarna) — jangan diganti warnanya. */
function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.05 6.05 29.3 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.2-.13-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.05 6.05 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C39.9 36.2 44 30.7 44 24c0-1.2-.13-2.4-.4-3.5z"
      />
    </svg>
  )
}

/** Layar masuk/daftar — tampil kalau backend aktif dan user belum login. */
export default function Login() {
  const t = useT()
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail)
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail)
  const pendingEmail = useAuthStore((s) => s.pendingEmail)
  const backendUnavailable = useAuthStore((s) => s.backendUnavailable)
  const continueLocally = useAuthStore((s) => s.continueLocally)
  const clearPendingEmail = useAuthStore((s) => s.clearPendingEmail)

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(friendlyError(e, t))
    } finally {
      setBusy(false)
    }
  }

  // Daftar via email → tunggu konfirmasi
  if (pendingEmail) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-8 text-center">
        <AmbientBackground />
        <RapiMascot size={120} />
        <p className="text-lg font-bold text-rapi-navy dark:text-rapi-dark-ink">
          {t.auth.checkEmailTitle}
        </p>
        <p className="text-sm leading-relaxed text-rapi-gray-600">
          {t.auth.checkEmailDesc(pendingEmail)}
        </p>
        <RapiButton variant="ghost" onClick={clearPendingEmail}>
          {t.auth.backToLogin}
        </RapiButton>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10">
      <AmbientBackground />

      <div className="animate-rapi-fade-up flex flex-col items-center text-center">
        <RapiMascot size={124} />
        <h1 className="mt-4 text-2xl font-bold text-rapi-navy dark:text-rapi-dark-ink">
          {t.auth.welcome}
        </h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-rapi-gray-600">
          {t.auth.subtitle}
        </p>
      </div>

      <div className="animate-rapi-fade-up mt-6 rounded-rapi-md border border-rapi-yellow/60 bg-rapi-yellow/15 p-3 text-center">
        {backendUnavailable || error === t.auth.errOffline ? (
          <p className="text-xs leading-relaxed text-rapi-navy">{t.auth.errOffline}</p>
        ) : (
          <p className="text-xs leading-relaxed text-rapi-navy">{t.auth.localModeHint}</p>
        )}
        <button
          type="button"
          onClick={continueLocally}
          className="mx-auto mt-2 flex min-h-11 items-center gap-2 text-[13px] font-bold text-rapi-blue"
        >
          <WifiOff size={15} />
          {t.auth.continueLocal}
        </button>
      </div>

      {/* Google — jalur utama, paling sedikit friksi */}
      <button
        type="button"
        disabled={busy}
        onClick={() => run(signInWithGoogle)}
        style={{ animationDelay: '90ms' }}
        className="animate-rapi-fade-up mt-7 flex min-h-12 w-full items-center justify-center gap-2.5 rounded-rapi-md border-[1.5px] border-rapi-gray-300 bg-white text-sm font-bold text-rapi-navy transition-transform active:scale-[0.98] disabled:opacity-50 dark:border-white/15 dark:bg-white/10 dark:text-rapi-dark-ink"
      >
        <GoogleIcon />
        {t.auth.google}
      </button>

      <div
        className="animate-rapi-fade-up my-5 flex items-center gap-3"
        style={{ animationDelay: '140ms' }}
      >
        <span className="h-px flex-1 bg-rapi-gray-300 dark:bg-white/10" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-rapi-gray-600">
          {t.auth.or}
        </span>
        <span className="h-px flex-1 bg-rapi-gray-300 dark:bg-white/10" />
      </div>

      <form
        className="animate-rapi-fade-up flex flex-col gap-3"
        style={{ animationDelay: '190ms' }}
        onSubmit={(e) => {
          e.preventDefault()
          run(() =>
            mode === 'signin'
              ? signInWithEmail(email.trim(), password)
              : signUpWithEmail(email.trim(), password),
          )
        }}
      >
        <div>
          <label htmlFor="auth-email" className="mb-1 block text-xs font-bold text-rapi-gray-600">
            {t.auth.email}
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.auth.emailPlaceholder}
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="auth-pass" className="mb-1 block text-xs font-bold text-rapi-gray-600">
            {t.auth.password}
          </label>
          {/* Tombol lihat kata sandi — di HP, salah ketik password itu mahal
              karena hurufnya nggak kelihatan sama sekali. */}
          <div className="relative">
            <input
              id="auth-pass"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.passwordPlaceholder}
              className={cn(INPUT, 'pr-12')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-rapi-gray-600 transition-colors hover:text-rapi-blue"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-rapi-md bg-rapi-expense-soft px-3 py-2.5 text-[13px] font-medium text-rapi-expense dark:bg-rapi-expense/20"
          >
            {error}
          </p>
        )}

        <RapiButton
          type="submit"
          variant="blue"
          disabled={busy}
          className={cn('mt-1 min-h-12 w-full text-base', busy && 'opacity-70')}
        >
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t.auth.signingIn}
            </>
          ) : (
            <>
              <Mail size={16} />
              {mode === 'signin' ? t.auth.signIn : t.auth.signUp}
            </>
          )}
        </RapiButton>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
          setError(null)
        }}
        className="animate-rapi-fade-up mx-auto mt-4 min-h-11 text-[13px] font-semibold text-rapi-blue"
        style={{ animationDelay: '240ms' }}
      >
        {mode === 'signin' ? t.auth.noAccount : t.auth.haveAccount}
      </button>
    </div>
  )
}
