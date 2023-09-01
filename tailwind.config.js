/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/extension/devtools/panel.html",
    "./src/application/**/*.{html,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
