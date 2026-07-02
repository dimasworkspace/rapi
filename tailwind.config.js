/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rapi: {
          yellow: '#F8D613',
          navy: '#111835',
          blue: '#0248C1',
          offwhite: '#FBFCFC',
          income: '#16A34A',
          'income-soft': '#E9F8EF',
          expense: '#EF4444',
          'expense-soft': '#FDEDED',
          'savings-soft': '#E7EEFC',
          'warning-soft': '#FEF7DA',
          gray: { 600: '#5B6478', 300: '#D8DCE6', 100: '#F1F3F8' },
        },
      },
      fontFamily: {
        sulphur: ['Sulphur Point', 'Poppins', 'sans-serif'],
        sans: ['Sulphur Point', 'Poppins', 'sans-serif'],
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
    },
  },
  plugins: [],
}
