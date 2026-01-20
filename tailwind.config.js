/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        'neumorph': '5px 5px 10px #bebebe, -5px -5px 10px #ffffff',
        'neumorph-dark': '5px 5px 10px #0f172a, -5px -5px 10px #1e293b',
        'neumorph-inset': 'inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff',
        'neumorph-inset-dark': 'inset 5px 5px 10px #0f172a, inset -5px -5px 10px #1e293b',
      }
    },
  },
  plugins: [],
}