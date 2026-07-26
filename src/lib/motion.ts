import type { Transition } from 'framer-motion'

// Token motion Rapi — satu ritme untuk seluruh app (aturan motion-consistency).
// Enter pakai spring biar hidup; exit tween lebih cepat (~60-70% durasi enter).

/** Spring standar untuk modal/sheet/kartu yang muncul. */
export const SPRING_POP: Transition = { type: 'spring', stiffness: 320, damping: 26 }

/** Spring kecil untuk elemen ringan (toast, chip). */
export const SPRING_SOFT: Transition = { type: 'spring', stiffness: 340, damping: 24 }

/** Exit harus lebih cepat dari enter (aturan exit-faster-than-enter). */
export const TWEEN_EXIT: Transition = { duration: 0.18, ease: 'easeIn' }

/** Fade backdrop. */
export const FADE: Transition = { duration: 0.2 }

/** Easing masuk halaman (ease-out custom Rapi). */
export const EASE_PAGE: Transition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
