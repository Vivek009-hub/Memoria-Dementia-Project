/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        memora: {
          bg: '#151515',
          sidebar: '#1B1B1B',
          surface: '#202020',
          'surface-secondary': '#242424',
          'surface-hover': '#2A2A2A',
          border: '#343434',
          text: '#F5F5F0',
          'text-secondary': '#A7A7A2',
          'text-muted': '#A7A7A2',
          'text-subtle': '#74746F',
          accent: '#D8B24C',
          'accent-bright': '#F0C75E',
          'accent-hover': '#F0C75E',
          'accent-bg': 'rgba(216, 178, 76, 0.10)',
          danger: '#D95C5C',
          'danger-bg': 'rgba(217, 92, 92, 0.12)',
          success: '#45B982',
          'success-bg': 'rgba(69, 185, 130, 0.12)',
          warning: '#E5A83B',
          purple: '#9B6B9E',
          pink: '#E8688A',
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
