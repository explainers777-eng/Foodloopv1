import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#effaf2",
          100: "#d8f3df",
          500: "#25a55b",
          600: "#188247",
          700: "#16683b",
          950: "#092617"
        },
        citrus: {
          100: "#fff1d6",
          400: "#ffb23f",
          500: "#f88c24",
          600: "#db6815"
        }
      },
      boxShadow: {
        glow: "0 24px 80px rgba(37, 165, 91, 0.22)",
        card: "0 18px 45px rgba(15, 23, 42, 0.10)"
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(rgba(37,165,91,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(37,165,91,.12) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
