/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f5ef",
        ink: "#0f172a",
        accent: "#0d9488",
        warm: "#f59e0b"
      },
      fontFamily: {
        heading: ["'Space Grotesk'", "sans-serif"],
        body: ["'Sora'", "sans-serif"]
      },
      boxShadow: {
        glow: "0 16px 36px rgba(13, 148, 136, 0.18)",
      }
    },
  },
  plugins: [],
};
