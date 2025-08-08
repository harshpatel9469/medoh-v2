import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "card-background-primary-gradient": "var(--card-background-primary-gradient)",
      },
      colors: {
        'amber-500-opacity': 'rgba(245,158,11,0.7)', // Adjust the opacity value as needed
        'amber-400-opacity': 'rgba(251,191,36,0.7)', // Adjust the opacity value as needed
        'primary-color': 'rgb(var(--primary-color-rgb))',
        'primary-color-light': 'rgb(var(--primary-color-light-rgb))',
        'primary-color-dark': 'rgb(var(--primary-color-dark-rgb))',
      },
      textColor: {
        DEFAULT: '#4A5568', // Replace this with your desired color
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
export default config;
