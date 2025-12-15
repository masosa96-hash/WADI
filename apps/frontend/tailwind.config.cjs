module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        wadi: {
          bg: "#111827",
          surface: "#1F2937",
          text: "#F9FAFB",
          subtle: "#9CA3AF",
          tension: "#FACC15",
          action: "#7C3AED",
          neutral: "#F3F4F6",
        },
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
