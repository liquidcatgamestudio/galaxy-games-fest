/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./_includes/**/*.html",
    "./*.html",
    "./privacy/*.html",
    "./posts/**/*.md",
    "./posts/**/*.html",
    "./src/**/*.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['"Outfit"', 'sans-serif'],
        boldonse: ['"Boldonse"', 'sans-serif'],
      },
      colors: {
        black: '#000000',
        darkblue: '#030328',
        blue: '#1618B7',
        turquoise: '#4BD6B5',
        white: '#DEDEE3',
        lilac: '#A2A8D0',
        darklilac: '#6971C1',
        purple: '#702AA6',
        pink: '#C531AF',
        darkpurple: '#0D0328',
        borderpurple: '#1f075f'
      }
    }
  },
  plugins: []
};
