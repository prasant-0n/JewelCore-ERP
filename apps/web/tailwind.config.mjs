/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        obsidian: {
          DEFAULT: "hsl(var(--background) / <alpha-value>)",
          deep: "hsl(var(--background-deep) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          card: "hsl(var(--surface-card) / <alpha-value>)",
          elevated: "hsl(var(--surface-elevated) / <alpha-value>)",
          hover: "hsl(var(--surface-hover) / <alpha-value>)",
          border: "hsl(var(--surface-border) / <alpha-value>)",
          borderMuted: "hsl(var(--surface-border-muted) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "hsl(var(--gold) / <alpha-value>)",
          primary: "hsl(var(--gold) / <alpha-value>)",
          light: "hsl(var(--gold-light) / <alpha-value>)",
          dark: "hsl(var(--gold-dark) / <alpha-value>)",
          muted: "hsl(var(--gold) / 0.12)",
          border: "hsl(var(--gold) / 0.25)",
        },
        platinum: {
          DEFAULT: "hsl(var(--platinum) / <alpha-value>)",
          light: "hsl(var(--platinum-light) / <alpha-value>)",
          dark: "hsl(var(--platinum-dark) / <alpha-value>)",
        },
        status: {
          emerald: "hsl(var(--status-emerald) / <alpha-value>)",
          emeraldBg: "hsl(var(--status-emerald) / 0.12)",
          amber: "hsl(var(--status-amber) / <alpha-value>)",
          amberBg: "hsl(var(--status-amber) / 0.12)",
          rose: "hsl(var(--status-rose) / <alpha-value>)",
          roseBg: "hsl(var(--status-rose) / 0.12)",
          indigo: "hsl(var(--status-indigo) / <alpha-value>)",
          indigoBg: "hsl(var(--status-indigo) / 0.12)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Instrument Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: [
          "var(--font-serif)",
          "Newsreader",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        mono: [
          "var(--font-mono)",
          "JetBrains Mono",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
