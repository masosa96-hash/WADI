module.exports = {
  content: ["./apps/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        wadi: {
          bg: "#111827", // fondo absoluto
          surface: "#1F2937", // para tarjetas o bloques
          text: "#F9FAFB", // texto claro principal
          subtle: "#9CA3AF", // texto secundario
          tension: "#FACC15", // amarillo lúcido (tensión / advertencia)
          action: "#7C3AED", // violeta denso (acción)
          neutral: "#F3F4F6", // fondo gris claro
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
