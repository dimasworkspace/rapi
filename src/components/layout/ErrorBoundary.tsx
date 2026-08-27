import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

/** Tangkap crash render biar app nggak jadi layar putih kosong.
 *  Self-contained (nggak pakai i18n/router) — copy dwibahasa ringan dari
 *  preferensi tersimpan, fallback Indonesia. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log lokal buat debugging — nggak dikirim ke mana-mana
    console.error('Rapi crash:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    let en = false
    try {
      en = JSON.parse(localStorage.getItem('rapi-settings') || '{}')?.state?.lang === 'en'
    } catch {
      en = false
    }

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-rapi-offwhite px-8 text-center dark:bg-rapi-dark">
        <img src="/logo-rapi.png" alt="Logo Rapi" width={104} height={63} className="h-20 w-auto object-contain" />
        <div>
          <p className="text-lg font-bold text-rapi-navy dark:text-rapi-dark-ink">
            {en ? 'Oops, something broke 😔' : 'Waduh, ada yang error 😔'}
          </p>
          <p className="mt-1 text-sm text-rapi-gray-600">
            {en
              ? "Don't worry, your data is safe. Let's reload."
              : 'Tenang, datamu aman kok. Yuk muat ulang.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-11 rounded-rapi-md bg-rapi-blue px-6 text-sm font-bold text-white shadow-rapi-card transition-transform active:scale-[0.97]"
        >
          {en ? 'Reload' : 'Muat Ulang'}
        </button>
      </div>
    )
  }
}
