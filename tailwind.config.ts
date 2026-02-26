import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Lora", "Georgia", "Cambria", "serif"],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
      },
      colors: {
        ink: {
          950: "#0a0a0a",
          900: "#1a1a1a",
          800: "#2d2d2d",
          700: "#404040",
          600: "#525252",
          500: "#6b6b6b",
          400: "#8a8a8a",
          300: "#b0b0b0",
          200: "#d6d6d6",
          100: "#ededed",
          50: "#f7f7f7",
        },
        accent: {
          DEFAULT: "#b91c1c",
          dark: "#991b1b",
          light: "#fef2f2",
        },
      },
      fontSize: {
        "headline-xl": [
          "2rem",
          { lineHeight: "2.4rem", letterSpacing: "-0.025em", fontWeight: "700" },
        ],
        "headline-lg": [
          "1.625rem",
          { lineHeight: "2rem", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "headline-md": [
          "1.2rem",
          { lineHeight: "1.55rem", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        "headline-sm": [
          "1.0625rem",
          { lineHeight: "1.4rem", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "body-lg": ["1.0625rem", { lineHeight: "1.75rem" }],
        "body-md": ["0.9375rem", { lineHeight: "1.625rem" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.375rem" }],
        caption: [
          "0.6875rem",
          { lineHeight: "1rem", letterSpacing: "0.04em" },
        ],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      maxWidth: {
        content: "740px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover":
          "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        modal:
          "0 25px 50px -12px rgba(0,0,0,0.25), 0 10px 20px -5px rgba(0,0,0,0.1)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 3s infinite",
        fadeIn: "fadeIn 0.3s ease-out",
        slideUp: "slideUp 0.35s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
