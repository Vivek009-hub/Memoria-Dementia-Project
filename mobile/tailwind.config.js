/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        memora: {
          bg: '#121212',
          sidebar: '#0F172A',
          surface: '#0F172A',
          'surface-elevated': '#151B2B',
          'surface-secondary': '#1A1A1A',
          'surface-hover': '#242D40',
          border: '#27324A',
          text: '#F8FAFC',
          'text-secondary': '#CBD5E1',
          'text-muted': '#94A3B8',
          'text-subtle': '#64748B',
          accent: '#F4C542',
          'accent-bright': '#FFD75A',
          'accent-hover': '#FFD75A',
          'accent-bg': 'rgba(244, 197, 66, 0.12)',
          danger: '#EF4444',
          'danger-bg': 'rgba(239, 68, 68, 0.12)',
          success: '#10B981',
          'success-bg': 'rgba(16, 185, 129, 0.12)',
          warning: '#F59E0B',
          purple: '#6366F1',
          indigo: '#818CF8',
          teal: '#14B8A6',
          lavender: '#A78BFA',
          blue: '#60A5FA',
        },
        brand: {
          50: '#fcf8eb',
          100: '#f8eece',
          500: '#D8B24C',
          600: '#F0C75E',
          700: '#b89938',
          900: '#635119',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Montserrat', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
