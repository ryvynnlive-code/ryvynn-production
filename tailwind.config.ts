import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        flame: {
          cyan: "#00d9ff",
          purple: "#b830ff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
