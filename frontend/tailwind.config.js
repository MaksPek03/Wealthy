/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "background": "#ffffff",
        "background-dark": "#868686",
        "headers": "#cccccc",
        "headers-dark": "#1e1e1e",
        "buttons": "#dfdfdf",
        "buttons-dark": "#737373",
        "text": "#000000",
        "text-dark": "#ffffff",
        "headers-text": "#ffffff",
        "headers-text-dark": "#9f9f9f",
        "selected": "#272727",
        "no-selected": "#707070",
      }
    },
  },
  plugins: [],
}

