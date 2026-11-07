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
        obsidian: {
          DEFAULT: "#0B0F17",
          deep: "#070A10",
        },
        surface: {
          DEFAULT: "#131B2B",
          card: "#131B2B",
          elevated: "#1C263B",
          hover: "#222F47",
          border: "#1F293D",
          borderMuted: "#1A2334",
        },
        gold: {
          DEFAULT: "#D4AF37",
          primary: "#D4AF37",
          light: "#E5C358",
          dark: "#B89628",
          muted: "rgba(212, 175, 55, 0.12)",
          border: "rgba(212, 175, 55, 0.25)",
        },
        platinum: {
          DEFAULT: "#94A3B8",
          light: "#E2E8F0",
          dark: "#64748B",
        },
        status: {
          emerald: "#10B981",
          emeraldBg: "rgba(16, 185, 129, 0.12)",
          amber: "#F59E0B",
          amberBg: "rgba(245, 158, 11, 0.12)",
          rose: "#F43F5E",
          roseBg: "rgba(244, 63, 94, 0.12)",
          indigo: "#6366F1",
          indigoBg: "rgba(99, 102, 241, 0.12)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
