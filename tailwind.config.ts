import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Sunset Beach Custom Colors
        sunset: {
          gold: "hsl(var(--sunset-gold))",
          orange: "hsl(var(--sunset-orange))",
          coral: "hsl(var(--sunset-coral))",
          pink: "hsl(var(--sunset-pink))",
        },
        ocean: {
          light: "hsl(var(--ocean-light))",
          DEFAULT: "hsl(var(--ocean))",
          dark: "hsl(var(--ocean-dark))",
          deep: "hsl(var(--ocean-deep))",
        },
        sand: {
          light: "hsl(var(--sand-light))",
          DEFAULT: "hsl(var(--sand))",
          dark: "hsl(var(--sand-dark))",
        },
        silhouette: {
          DEFAULT: "hsl(var(--silhouette))",
          light: "hsl(var(--silhouette-light))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-quicksand)", "sans-serif"],
        body: ["var(--font-geist-sans)", "sans-serif"],
      },
      backgroundImage: {
        "sunset-gradient": "linear-gradient(180deg, hsl(var(--sunset-gold)) 0%, hsl(var(--sunset-orange)) 50%, hsl(var(--sunset-coral)) 100%)",
        "ocean-gradient": "linear-gradient(180deg, hsl(var(--ocean-light)) 0%, hsl(var(--ocean)) 50%, hsl(var(--ocean-dark)) 100%)",
        "beach-gradient": "linear-gradient(180deg, hsl(var(--sand-light)) 0%, hsl(var(--sand)) 50%, hsl(var(--sand-dark)) 100%)",
        "sky-gradient": "linear-gradient(180deg, hsl(218 16% 35%) 0%, hsl(38 90% 60%) 40%, hsl(45 100% 89%) 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "wave": "wave 8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        wave: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-5px)" },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
