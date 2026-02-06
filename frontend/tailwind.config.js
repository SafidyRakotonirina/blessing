/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0f5',
          100: '#cce1eb',
          200: '#99c3d7',
          300: '#66a5c3',
          400: '#3387af',
          500: '#01395a', // Couleur principale
          600: '#012d48',
          700: '#012136',
          800: '#001524',
          900: '#000912',
        },
      },
    },
  },
  plugins: [],
}