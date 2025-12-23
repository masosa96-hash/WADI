module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        wadi: {
          bg: "#101010",
          surface: "#1c1c1c",
          text: "#e0e0e0",
          subtle: "#a1a1aa", // Zinc-400 for secondary text
          accent: "#91f6d7", // Pale Cyan-Green
          danger: "#ff4d4f",
          border: "#27272a", // Zinc-800 for borders
        },
      },
      borderRadius: {
        wadi: "1rem",
      },
      boxShadow: {
        wadi: "0 2px 10px rgba(145, 246, 215, 0.1)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      spacing: {
        input: "3rem",
      },
    },
  },
  plugins: [],
};
