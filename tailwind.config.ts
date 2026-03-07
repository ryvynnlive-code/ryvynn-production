import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'ryvynn-cyan': '#00D9FF',
        'ryvynn-purple': '#8B5CF6',
      },
    },
  },
  plugins: [],
} satisfies Config;
