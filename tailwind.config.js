/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        pink:   { DEFAULT: '#DB2777', light: '#fce7f3', dark: '#be185d' },
        gold:   { DEFAULT: '#d97706', light: '#fef3c7', text: '#92400e' },
        silver: { DEFAULT: '#6b7280', light: '#f3f4f6', text: '#374151' },
        bronze: { DEFAULT: '#b45309', light: '#fef9c3', text: '#78350f' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card':      '0 2px 12px rgba(79,70,229,0.06)',
        'card-hover':'0 4px 20px rgba(79,70,229,0.12)',
        'glow':      '0 0 20px rgb(37 99 235 / 0.15)',
        'sidebar':   '2px 0 8px rgba(79,70,229,0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
