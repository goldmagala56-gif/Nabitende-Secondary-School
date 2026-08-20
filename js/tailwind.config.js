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
          blue: "#2E6FC9",     // primary brand blue — clean, unambiguous blue (VS Code HTML-tag blue family, deepened for text contrast)
          sky: "#569CD6",      // lighter blue for gradients & large accents — the exact VS Code HTML-tag blue
          accent: "#C9AA73",   // warm tan accent (used sparingly — badges, icons)
          cream: "#F0DFB8",    // concentrated cream — the site's background color
        },
      },
    },
  },
  plugins: [],
};