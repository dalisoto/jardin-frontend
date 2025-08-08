/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        hallo: ["HalloAlmond", "ui-sans-serif", "system-ui", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
