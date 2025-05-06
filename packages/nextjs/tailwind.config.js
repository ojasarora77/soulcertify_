/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#9C43FE",  // Purple
          "primary-content": "#110D2C",
          secondary: "#B980FF", // Lighter purple
          "secondary-content": "#110D2C",
          accent: "#8A3AE0", // Darker purple
          "accent-content": "#110D2C",
          neutral: "#110D2C",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#F8F5FF", // Very light purple
          "base-300": "#E9DEFF", // Light purple
          "base-content": "#110D2C",
          info: "#9C43FE",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",
          "--rounded-btn": "9999rem",
          ".tooltip": { "--tooltip-tail": "6px", "--tooltip-color": "oklch(var(--p))" },
          ".link": { textUnderlineOffset: "2px" },
          ".link:hover": { opacity: "80%" },
        },
      },
      {
        dark: {
          primary: "#9C43FE", // Purple
          "primary-content": "#FFF6F1",
          secondary: "#1E1B3D", // Darker blue
          "secondary-content": "#FFF6F1",
          accent: "#8A3AE0", // Darker purple
          "accent-content": "#FFF6F1",
          neutral: "#FFF6F1",
          "neutral-content": "#000000",
          "base-100": "#000000", // Black
          "base-200": "#000000", // Black
          "base-300": "#111111", // Very dark gray
          "base-content": "#FFF6F1",
          info: "#9C43FE",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",
          "--rounded-btn": "9999rem",
          ".tooltip": { "--tooltip-tail": "6px" },
          ".link": { textUnderlineOffset: "2px" },
          ".link:hover": { opacity: "80%" },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: { center: "0 0 12px -2px rgb(0 0 0 / 0.05)" },
      animation: { "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite" },
    },
  },
};
