/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          softblue: "#f0f8ff",
          primary: "#00bfa6",
          accent: "#007bff",
          muted: "#eaeaea",
          // Add these new colors to match your design
          secondary: "#009688", // A teal shade that complements your primary
          success: "#06d6a0",
          warning: "#ffbe0b",
          danger: "#ef476f",
          dark: "#1a1a2e",
          light: "#f8f9fa"
        },
        fontFamily: {
          sans: ["Poppins", "sans-serif"],
        }
      },
    },
    plugins: [],
  }