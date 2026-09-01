/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        memora: {
          bg: '#f8fafc',
          sidebar: '#ffffff',
          surface: '#ffffff',
          'surface-secondary': '#f1f5f9',
          'surface-hover': '#e2e8f0',
          border: '#e2e8f0',
          text: '#0f172a',
          'text-secondary': '#475569',
          'text-muted': '#64748b',
          'text-subtle': '#94a3b8',
          accent: '#2563eb',
          'accent-bright': '#1d4ed8',
          'accent-hover': '#1d4ed8',
          'accent-bg': 'rgba(37, 99, 235, 0.08)',
          danger: '#ef4444',
          'danger-bg': 'rgba(239, 68, 68, 0.12)',
          success: '#10b981',
          'success-bg': 'rgba(16, 185, 129, 0.12)',
          warning: '#f59e0b',
          purple: '#8b5cf6',
          pink: '#ec4899',
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
