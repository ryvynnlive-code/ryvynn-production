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
          50: "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#f0abfc",
          400: "#e879f9",
          500: "#d946ef",
          600: "#c026d3",
          700: "#9333ea",
          800: "#7e22ce",
          900: "#6b21a8",
          hot: "#e11d9a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": {
            textShadow: "0 0 20px rgba(192,38,211,0.7), 0 0 40px rgba(147,51,234,0.4)",
          },
          "50%": {
            textShadow: "0 0 30px rgba(192,38,211,0.9), 0 0 60px rgba(147,51,234,0.6), 0 0 80px rgba(225,29,154,0.3)",
          },
        },
        "card-glow": {
          "0%, 100%": {
            boxShadow: "0 0 15px rgba(192,38,211,0.08)",
          },
          "50%": {
            boxShadow: "0 0 25px rgba(192,38,211,0.15)",
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
        "sacred-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "sacred-pulse": {
          "0%, 100%": { opacity: "0.03" },
          "50%": { opacity: "0.06" },
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "card-glow": "card-glow 4s ease-in-out infinite",
        "breathe": "breathe 12s ease-in-out infinite",
        "slide-in": "slide-in 0.6s ease-out",
        "sacred-spin": "sacred-spin 120s linear infinite",
        "sacred-pulse": "sacred-pulse 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
