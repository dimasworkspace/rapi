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
    },
  },
  plugins: [],
}
