import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx,mdx}",
    "./src/lib/**/*.{ts,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#132321",
        forest: "#176b5b",
        teal: "#1f9a9d",
        coral: "#ef6f61",
        sun: "#f2c14e",
        leaf: "#62a87c",
        cloud: "#f8fbf8",
        mist: "#e6f0ea"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(24, 71, 66, 0.14)",
        line: "0 0 0 1px rgba(19, 35, 33, 0.08)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
