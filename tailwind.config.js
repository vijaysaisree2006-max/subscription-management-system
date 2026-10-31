/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        odoo: {
          purple: '#714B67',
          purpleDark: '#54364D',
          purpleLight: '#8F5E82',
          teal: '#008784',
          tealDark: '#006C6A',
          tealLight: '#00A09D',
          grayBg: '#F8F9FA',
          border: '#E2E8F0',
          textMain: '#212529',
          textMuted: '#6C757D',
        }
      }
    },
  },
  plugins: [],
}

