import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#F97316",
          foreground: "#ffffff",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Status colors
        emergency: {
          DEFAULT: "hsl(0 84% 55%)",
          foreground: "hsl(0 0% 100%)",
          bg: "hsl(0 84% 97%)",
        },
        urgent: {
          DEFAULT: "hsl(28 95% 50%)",
          foreground: "hsl(0 0% 100%)",
          bg: "hsl(28 95% 97%)",
        },
        success: {
          DEFAULT: "hsl(142 71% 40%)",
          foreground: "hsl(0 0% 100%)",
          bg: "hsl(142 71% 95%)",
        },
        warning: {
          DEFAULT: "hsl(45 95% 45%)",
          foreground: "hsl(0 0% 10%)",
          bg: "hsl(45 95% 95%)",
        },
        info: {
          DEFAULT: "hsl(210 80% 50%)",
          foreground: "hsl(0 0% 100%)",
          bg: "hsl(210 80% 96%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "pulse-emergency": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(0 84% 55% / 0.4)" },
          "50%": { boxShadow: "0 0 0 6px hsl(0 84% 55% / 0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-emergency": "pulse-emergency 2s infinite",
        "slide-in": "slide-in 0.25s ease-out",
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
