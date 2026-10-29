/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chess-bg': '#141517',
        'chess-card': '#1e2024',
        'chess-card-hover': '#26292f',
        'chess-card-active': '#2f333b',
        'chess-border': '#2e323b',
        'chess-border-light': '#3a3f4b',
        'board-light': '#f0d9b5',
        'board-dark': '#b58863',
        'board-highlight': '#f7f769',
        'board-lastmove': 'rgba(255, 235, 59, 0.45)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
};

