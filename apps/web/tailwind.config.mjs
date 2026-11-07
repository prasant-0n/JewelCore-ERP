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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        obsidian: {
          DEFAULT: "hsl(var(--background))",
          deep: "hsl(var(--background-deep))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          card: "hsl(var(--surface-card))",
          elevated: "hsl(var(--surface-elevated))",
          hover: "hsl(var(--surface-hover))",
          border: "hsl(var(--surface-border))",
          borderMuted: "hsl(var(--surface-border-muted))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          primary: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
          dark: "hsl(var(--gold-dark))",
          muted: "hsl(var(--gold) / 0.12)",
          border: "hsl(var(--gold) / 0.25)",
        },
        platinum: {
          DEFAULT: "hsl(var(--platinum))",
          light: "hsl(var(--platinum-light))",
          dark: "hsl(var(--platinum-dark))",
        },
        status: {
          emerald: "hsl(var(--status-emerald))",
          emeraldBg: "hsl(var(--status-emerald) / 0.12)",
          amber: "hsl(var(--status-amber))",
          amberBg: "hsl(var(--status-amber) / 0.12)",
          rose: "hsl(var(--status-rose))",
          roseBg: "hsl(var(--status-rose) / 0.12)",
          indigo: "hsl(var(--status-indigo))",
          indigoBg: "hsl(var(--status-indigo) / 0.12)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
