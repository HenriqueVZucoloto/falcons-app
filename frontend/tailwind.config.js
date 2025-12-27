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
        'falcons-black': '#121212',
        'falcons-gray': '#333333',
      }
    },
  },
  plugins: [],
}