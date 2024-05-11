/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#191d28",
        evening: "#2E3241",
        light: "#5DC7C2",
      },
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

