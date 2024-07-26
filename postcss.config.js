const PurgeCSSPlugin = require('@fullhuman/postcss-purgecss');
const glob = require('glob');
const path = require('path');

module.exports = {
  plugins: [
    process.env.NODE_ENV === 'production' &&
    new PurgeCSSPlugin({
      paths: glob.sync(path.resolve(__dirname, 'src/**/*.{js,jsx,ts,tsx,css,html}')),
      safelist: {
        standard: [/^some-regex-to-keep$/] // Modify this as needed
      }
    })
  ].filter(Boolean)
};
