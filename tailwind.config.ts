import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#202329", muted: "#68707B" },
        line: "#E6E8EC",
        surface: "#eef7ff",
        primary: { DEFAULT: "#176bc0", dark: "#12549a", soft: "#e6f2ff" },
        navy: { DEFAULT: "#14365b", soft: "#eaf3ff" },
        yellow: { DEFAULT: "#F8B931", soft: "#FFF6D9" },
        sale: "#176bc0",
        footer: { DEFAULT: "#14365b", text: "#E8EDF3", muted: "#AEB9C6" },
      },
      fontFamily: {
        display: ["Arial", "Helvetica", "sans-serif"],
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      fontSize: {
        title: ["2.25rem", { lineHeight: "1.2" }],
        hero: ["3.15rem", { lineHeight: "1.08" }],
      },
      maxWidth: { container: "1280px" },
      boxShadow: {
        card: "0 10px 30px rgba(23, 35, 51, 0.08)",
        soft: "0 2px 12px rgba(23, 35, 51, 0.08)",
      },
      scrollPadding: { header: "150px" },
    },
  },
  plugins: [],
};

export default config;
