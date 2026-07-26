/// <reference types="vite-plugin-pwa/client" />

// Event install prompt PWA (belum masuk lib.dom TypeScript)
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent
}
