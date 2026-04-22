// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Indigo-600. Adjust this hex to match your previous project's exact primary color.
      },
      scale: {
        '102': '1.02',
      }
    },
  },
  plugins: [],
}