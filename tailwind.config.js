/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0284c7", // Sky 600
        secondary: "#38bdf8", // Sky 400
        background: "#0f172a", // Slate 900
        surface: "#1e293b", // Slate 800
        accent: "#38bdf8",
      }
    },
  },
  plugins: [],
}
