module.exports = {
  presets: [
    "@babel/preset-env",
    ["@babel/preset-react", { pragma: "h" }],
    "@babel/preset-typescript"
  ],
  plugins: [
    "@babel/plugin-transform-runtime"
  ]
};
