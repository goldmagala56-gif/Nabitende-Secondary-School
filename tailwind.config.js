module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Times New Roman", "Times", "serif"],
        accent: ["Lucida Sans", "Lucida Sans Regular", "Lucida Grande", "Lucida Sans Unicode", "Verdana", "sans-serif"],
      },
      colors: {
        school: {
          blue: "#007ACC",
          sky: "#1F9CF0",
          navy: "#0B1B3F",
          accent: "#D9A438",
          cream: "#F2E9D8",
        },
      },
    },
  },
  plugins: [],
};