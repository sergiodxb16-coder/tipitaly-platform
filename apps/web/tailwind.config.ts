import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef9f0",
          100: "#fdefd8",
          200: "#fbdcac",
          300: "#f8c174",
          400: "#f49d3a",
          500: "#f17f18",
          600: "#e2630e",
          700: "#bb480e",
          800: "#963914",
          900: "#7a3013",
          950: "#421607",
        },
      },
    },
  },
  plugins: [],
};

export default config;
