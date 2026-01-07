/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
    "./constants.tsx",
    "./types.ts"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
