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
        serif: [
          "Georgia",
          "Cambria",
          '"Times New Roman"',
          "Times",
          "serif",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        ink: {
          950: "#0a0a0a",
          900: "#171717",
          800: "#262626",
          700: "#3f3f3f",
          600: "#525252",
          500: "#6b6b6b",
          400: "#8a8a8a",
          300: "#b0b0b0",
          200: "#d4d4d4",
          100: "#ebebeb",
          50: "#f5f5f5",
        },
        accent: {
          DEFAULT: "#b91c1c",
          dark: "#991b1b",
        },
      },
      fontSize: {
        "headline-lg": [
          "1.75rem",
          { lineHeight: "2.1rem", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "headline-md": [
          "1.25rem",
          { lineHeight: "1.6rem", letterSpacing: "-0.015em", fontWeight: "700" },
        ],
        "headline-sm": [
          "1.05rem",
          { lineHeight: "1.4rem", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "body-lg": ["0.975rem", { lineHeight: "1.65rem" }],
        "body-md": ["0.875rem", { lineHeight: "1.5rem" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.35rem" }],
        caption: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.03em" }],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      maxWidth: {
        content: "680px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
