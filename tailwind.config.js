/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./_includes/**/*.html",
    "./*.html",
    "./privacy/*.html",
    "./posts/**/*.md",
    "./posts/**/*.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['"Outfit"', 'sans-serif'],
        boldonse: ['"Boldonse"', 'sans-serif'],
      },
      colors: {
        tomato: '#e6482e',
        yellowMain: '#fde047',
        yellowLighter: '#fff085'
      }
    }
  },
  plugins: []
};
