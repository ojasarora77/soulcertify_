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
          primary: "#FF8A50",  // Light orange
          "primary-content": "#110D2C",
          secondary: "#FFD0B5", // Lighter orange
          "secondary-content": "#110D2C",
          accent: "#FF6B2C", // Brighter orange
          "accent-content": "#110D2C",
          neutral: "#110D2C",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#FFF6F1", // Very light orange
          "base-300": "#FFD0B5", // Light orange
          "base-content": "#110D2C",
          info: "#FF8A50",
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
          primary: "#FF8A50", // Light orange
          "primary-content": "#FFF6F1",
          secondary: "#1E1B3D", // Darker blue
          "secondary-content": "#FFF6F1",
          accent: "#FF6B2C", // Brighter orange
          "accent-content": "#FFF6F1",
          neutral: "#FFF6F1",
          "neutral-content": "#110D2C",
          "base-100": "#110D2C", // Dark blue
          "base-200": "#1E1B3D", // Less dark blue
          "base-300": "#2E2A5C", // Medium dark blue
          "base-content": "#FFF6F1",
          info: "#1E1B3D",
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
