/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'falcons-gold': '#FFD600',
        'falcons-gold-hover': '#e6c200',
        'falcons-bg': '#121212',
        'falcons-bg-card': '#1A1A1A',
        'falcons-bg-elevated': '#252525',
        'falcons-border': '#333333',
        'falcons-text': '#F5F5F5',
        'falcons-text-secondary': '#a0a0a0',
        'falcons-error': '#FF5555',
        'falcons-success': '#00BFA5',
        'falcons-surface': '#252525',
        'falcons-input': '#333333',
        'falcons-border-dark': '#444444',
      }
    },
  },
  plugins: [],
}