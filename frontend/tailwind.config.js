/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        card: "#111827",
        elevated: "#1F2937",
        tableHeader: "#0B1220",
        border: "#243041",
        accent: "#14B8A6",
        accentHover: "#0D9488",
        danger: "#EF4444",
        muted: "#6B7280",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
