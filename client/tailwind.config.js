/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chess-bg': '#111827',
        'chess-surface': '#1F2937',
        'chess-card': '#273244',
        'chess-hover': '#374151',
        'chess-border': '#4B5563',
        'chess-primary-grey': '#9CA3AF',
        'chess-light-grey': '#D1D5DB',
        'chess-white': '#F9FAFB',
        'board-light': '#D1D5DB',
        'board-dark': '#64748B',
        'board-border': '#374151',
        'board-bg': '#1F2937',
        'board-highlight': 'rgba(245, 158, 11, 0.45)',
        'board-lastmove': 'rgba(209, 213, 219, 0.35)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
};
