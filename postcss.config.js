// postcss.config.js
module.exports = {
    plugins: {
      '@tailwindcss/postcss': {},   // 👈 v4 plugin (NOT "tailwindcss")
      autoprefixer: {},
    },
  };