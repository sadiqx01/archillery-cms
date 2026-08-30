/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#001a40",
          "navy-light": "#002a5e",
          beige: "#fff8ed",
          "beige-dark": "#e8ded2",
          gold: "#ffc870",
          accent: "#006aff",
          dark: "#091122",
          surface: "#0a1628",
        },
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
