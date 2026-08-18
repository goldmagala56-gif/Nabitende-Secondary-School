/** Nabitende Secondary School — Tailwind build config
 *  Edit the colors below to adjust the site palette everywhere at once,
 *  then rebuild with: npm run build:css
 */
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
          blue: "#4770f5",    // primary brand blue
          sky: "#73c3f5",     // secondary/lighter blue for gradients & accents
          accent: "#f3db6f",  // warm sand accent
          cream: "#fdf79e",   // base cream
        },
      },
    },
  },
  plugins: [],
};