// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF8F0", 100: "#FFECD2", 200: "#FFD6A5",
          300: "#FFB703", 400: "#F48C06", 500: "#E85D04",
          600: "#D00000", 700: "#9D0208", 800: "#6A040F", 900: "#370617",
        },
        sage: { 500: "#2D6A4F", 600: "#1B4332" },
        surface: "#FAF7F2",
        text: "#1A1A1A",
      },
    },
  },
  // ✅ Hapus baris plugins: [require("tailwindcss-animate")]
} satisfies Config;