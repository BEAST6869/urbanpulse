/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
        // Glass morphism colors
        glass: {
          white: "rgba(255, 255, 255, 0.25)",
          black: "rgba(0, 0, 0, 0.25)",
          light: "rgba(255, 255, 255, 0.1)",
          dark: "rgba(0, 0, 0, 0.1)",
        },
        // Apple-like gradients
        apple: {
          blue: "#007AFF",
          indigo: "#5856D6",
          purple: "#AF52DE",
          pink: "#FF2D92",
          red: "#FF3B30",
          orange: "#FF9500",
          yellow: "#FFCC00",
          green: "#30D158",
          mint: "#00C7BE",
          teal: "#59ADC4",
          cyan: "#55BEF0",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "bounce-in": "bounceIn 0.6s ease-out",
        "glass-shimmer": "glassShimmer 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        glassShimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.8)" },
        },
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(31, 38, 135, 0.25)",
        "glass-lg": "0 12px 48px 0 rgba(31, 38, 135, 0.45)",
        "glass-inset": "inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)",
        "glow": "0 0 20px rgba(59, 130, 246, 0.5)",
        "glow-lg": "0 0 40px rgba(59, 130, 246, 0.6)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
