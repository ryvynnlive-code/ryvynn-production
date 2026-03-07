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
      spacing: {
        // Sacred Dual Flame Spacing (Fibonacci sequence based on φ)
        'flame-xs': '8px',        // Shadow
        'flame-sm': '13px',       // Ember
        'flame-md': '21px',       // Flame
        'flame-lg': '34px',       // Blaze
        'flame-xl': '55px',       // Inferno
        'flame-2xl': '89px',      // Radiance
        'flame-3xl': '144px',     // Transcendence
      },
      borderRadius: {
        // Golden Ratio border radii
        'sacred-sm': '5px',
        'sacred-md': '8px',
        'sacred-lg': '13px',
        'sacred-xl': '21px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan': 'glow-cyan 3s ease-in-out infinite',
        'glow-purple': 'glow-purple 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'glow-cyan': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(0, 217, 255, 0.6)',
          },
        },
        'glow-purple': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
          },
        },
        'float': {
          '0%, 100%': { 
            transform: 'translateY(0px)',
          },
          '50%': { 
            transform: 'translateY(-20px)',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
