import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        flame: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": {
            textShadow: "0 0 20px rgba(249,115,22,0.6), 0 0 40px rgba(249,115,22,0.3)",
          },
          "50%": {
            textShadow: "0 0 30px rgba(249,115,22,0.8), 0 0 60px rgba(249,115,22,0.5), 0 0 80px rgba(249,115,22,0.2)",
          },
        },
        "card-glow": {
          "0%, 100%": {
            boxShadow: "0 0 15px rgba(249,115,22,0.05)",
          },
          "50%": {
            boxShadow: "0 0 25px rgba(249,115,22,0.1)",
          },
        },
        "breathe": {
          "0%": { transform: "scale(0.6)", opacity: "0.4" },
          "25%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1)", opacity: "0.8" },
          "75%": { transform: "scale(0.6)", opacity: "0.4" },
          "100%": { transform: "scale(0.6)", opacity: "0.4" },
        },
        "slide-in": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "card-glow": "card-glow 4s ease-in-out infinite",
        "breathe": "breathe 12s ease-in-out infinite",
        "slide-in": "slide-in 0.6s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
