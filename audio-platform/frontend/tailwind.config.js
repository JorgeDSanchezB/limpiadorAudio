/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#171412",
          panel: "#221D19",
          raised: "#2B241E",
          line: "#3A332C",
        },
        paper: {
          DEFAULT: "#EDE5DA",
          dim: "#A99D92",
        },
        amber: {
          DEFAULT: "#E8A33D",
          deep: "#C07F22",
        },
        signal: {
          DEFAULT: "#58B08C",
          deep: "#3E8A69",
        },
        danger: {
          DEFAULT: "#D07A55",
        },
      },
      fontFamily: {
        display: ['Bahnschrift', '"Arial Narrow"', 'sans-serif'],
        body: ['"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Cascadia Mono"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
