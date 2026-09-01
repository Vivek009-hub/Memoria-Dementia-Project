/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        memora: {
          bg: '#1E1E1E',
          sidebar: '#1B1B1B',
          surface: '#252525',
          'surface-secondary': '#2A2A2A',
          border: '#343434',
          text: '#E8E8E8',
          'text-muted': '#A0A0A0',
          'text-subtle': '#747474',
          accent: '#DDBB55',
          'accent-hover': '#E8C968',
          'accent-bg': 'rgba(221, 187, 85, 0.10)',
          danger: '#C95C5C',
          success: '#8BAA78',
        },
        brand: {
          50: '#fcf8eb',
          100: '#f8eece',
          500: '#DDBB55',
          600: '#E8C968',
          700: '#b89938',
          900: '#635119',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'Manrope', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

