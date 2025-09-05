import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        // Background and UI colors
        "background-color": "#0B0C10",
        "card-background": "#121620",
        "text-primary": "#E5E7EB",
        "text-secondary": "#9CA3AF",
        "section-title": "#1C1C1C",
        "section-description": "#838790",

        ai: {
          DEFAULT: "#FDEBCF",
          light: "#FDEBCF",
          dark: "#0A080E",
        },
        red: {
          error: "#FF8077",
        },
        yellow: {
          warning: "#FFA822",
        },
        toast: {
          default: "#242C32",
        },
        green: {
          ready: "#07D993",
          increase: "#64EBBC",
        },

        // shadcn UI colors
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
      },
      opacity: {
        "1": "0.01",
        "2": "0.02",
        "3": "0.03",
        "4": "0.04",
        "5": "0.05",
        "6": "0.06",
        "7": "0.07",
        "8": "0.08",
        "9": "0.09",
      },
      boxShadow: {},
      backgroundImage: {},
      borderRadius: {
        none: "0",
        sm: "0.25rem", // 4px
        md: "0.5rem", // 8px
        lg: "0.75rem", // 12px
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
        "3xl": "2rem", // 32px
        full: "9999px",
      },
      backdropBlur: {},
      transitionDuration: {
        "250": "250ms",
        "300": "300ms",
        "400": "400ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.25, 0.1, 0.25, 1)", // Standard ease-out
        emphasis: "cubic-bezier(0.175, 0.885, 0.32, 1.275)", // Elastic
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out": {
          "0%": {
            opacity: "1",
            transform: "translateY(0)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
        },
        "fade-in-out": {
          "0%": {
            opacity: "0",
          },
          "50%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0",
          },
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "hover-scale": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.98)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "0.6",
            transform: "scale(0.95)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.05)",
          },
        },
        "pulse-slow": {
          "0%, 100%": {
            boxShadow: "0 0 15px rgba(255, 168, 34, 0.6)",
            transform: "scale(1)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(255, 168, 34, 0.8)",
            transform: "scale(1.05)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-5px)",
          },
        },
        "bounce-gentle": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-2px)",
          },
        },
        shine: {
          "0%": { "background-position": "100%" },
          "100%": { "background-position": "-100%" },
        },
      },
      animation: {
        "accordion-down":
          "accordion-down 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
        "accordion-up": "accordion-up 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
        "fade-out": "fade-out 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
        "scale-in": "scale-in 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
        "hover-scale": "hover-scale 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)",
        "slow-spin": "spin 4s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
        "pulse-glow": "pulse-glow 3s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
        float: "float 4s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
        "bounce-gentle":
          "bounce-gentle 1.2s infinite cubic-bezier(0.4,0,0.2,1)",
        shine: "shine 5s linear infinite",
        "fade-in-out": "fade-in-out 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
      },
      spacing: {
        // Standard spacing scale
        xs: "0.25rem", // 4px
        sm: "0.5rem", // 8px
        md: "1rem", // 16px
        lg: "1.5rem", // 24px
        xl: "2rem", // 32px
        "2xl": "2.5rem", // 40px
        "3xl": "3rem", // 48px
      },
      fontSize: {
        "13px": "13px",
        "11px": "[11px, 16px]",
        "10px": "10px",
      },
      maxWidth: {
        "1/4": "25%",
        "1/2": "50%",
        "3/4": "75%",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
