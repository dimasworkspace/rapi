/** @type {import('tailwindcss').Config} */
// Token desain disalin dari app Rapi (tailwind.config.js di root) supaya
// landing page dan produknya terasa satu keluarga — warna, radius, dan
// bayangannya identik, bukan mirip-mirip.
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rapi: {
          yellow: '#F8D613',
          navy: '#111835',
          blue: '#0248C1',
          offwhite: '#FBFCFC',
          income: '#16A34A',
          expense: '#EF4444',
          gray: { 600: '#5B6478', 300: '#D8DCE6', 100: '#F1F3F8' },
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'rapi-sm': '8px',
        'rapi-md': '12px',
        'rapi-lg': '16px',
        'rapi-xl': '24px',
      },
      boxShadow: {
        'rapi-card': '0 2px 14px rgba(17,24,53,0.07)',
        'rapi-elevated': '0 10px 30px rgba(17,24,53,0.14)',
        'rapi-fab': '0 8px 22px rgba(2,72,193,0.35)',
      },
      maxWidth: {
        content: '72rem',
      },
      // Skala tipe display — landing page butuh ukuran yang lebih berani
      // daripada app. Angkanya clamp() supaya turun mulus di HP tanpa
      // breakpoint manual.
      fontSize: {
        'display-xl': ['clamp(2.75rem,8vw,5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
        'display-lg': ['clamp(2rem,5vw,3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(1.5rem,3.5vw,2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      // Token gerak — satu sumber biar semua animasi terasa dari keluarga
      // yang sama, bukan tiap komponen bikin easing sendiri.
      transitionTimingFunction: {
        'rapi-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'rapi-reveal': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'rapi-caret': {
          '0%, 45%': { opacity: '1' },
          '50%, 95%': { opacity: '0' },
        },
        'rapi-pop': {
          from: { opacity: '0', transform: 'scale(0.94) translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'rapi-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'rapi-reveal': 'rapi-reveal 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'rapi-caret': 'rapi-caret 1.1s steps(1) infinite',
        'rapi-pop': 'rapi-pop 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'rapi-float': 'rapi-float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
