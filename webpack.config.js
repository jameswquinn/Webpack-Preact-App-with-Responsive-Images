const path = require("path");
const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ImageminWebpackPlugin = require("imagemin-webpack-plugin").default;
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const WebpackPwaManifest = require("webpack-pwa-manifest");
const { GenerateSW } = require("workbox-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const { merge } = require("webpack-merge");
const PurgeCSSPlugin = require("@fullhuman/postcss-purgecss");
const ImageminPlugin = require("imagemin-webpack-plugin").default;

const pathsToPurge = glob.sync(
  path.resolve(__dirname, "src/**/*.{js,jsx,ts,tsx,css,html}"),
);

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === "development";

  const commonConfig = {
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isDevelopment
        ? "[name].bundle.js"
        : "[name].[contenthash].bundle.js",
      chunkFilename: isDevelopment
        ? "[id].chunk.js"
        : "[id].[contenthash].chunk.js",
      assetModuleFilename: "assets/[hash][ext][query]",
      clean: true,
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      alias: {
        react: "preact/compat",
        "react-dom": "preact/compat",
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                ["@babel/preset-react", { pragma: "h" }],
                "@babel/preset-typescript",
              ],
              plugins: ["@babel/plugin-transform-runtime"],
              cacheDirectory: true,
            },
          },
        },
        {
          test: /\.s?[ac]ss$/,
          use: [
            isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    !isDevelopment &&
                      new PurgeCSSPlugin({
                        paths: pathsToPurge,
                        safelist: {
                          standard: [/^some-regex-to-keep$/], // Modify this as needed
                        },
                      }),
                  ].filter(Boolean),
                },
              },
            },
            "sass-loader",
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 8192, // 8 KB
                name: "[path][name].[ext]",
              },
              loader: "responsive-loader",
              options: {
                adapter: require("responsive-loader/sharp"),
                sizes: [300, 600, 1200],
                placeholder: true,
                placeholderSize: 50,
                name: "images/[name]-[width].[ext]",
                format: "webp", // Use WebP format for better compression
              },
            },
          ],
          type: "javascript/auto", // Needed to prevent asset modules from conflicting
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        minify: !isDevelopment,
      }),
      new FaviconsWebpackPlugin("./src/assets/icon.png"),
      new ImageminPlugin({
        test: /\.(jpe?g|png|gif|svg)$/i,
        pngquant: {
          quality: "95-100",
        },
      }),
    ],
  };

  const developmentConfig = {
    mode: "development",
    devtool: "eval-source-map",
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      port: 9001,
      open: true,
      host: "0.0.0.0",
      allowedHosts: "all",
      hot: true,
      historyApiFallback: true,
      compress: true,
      client: {
        webSocketURL: "auto://0.0.0.0:0/ws",
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  };

  const productionConfig = {
    mode: "production",
    devtool: "source-map",
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
      runtimeChunk: "single",
    },
    performance: {
      hints: "warning",
      maxEntrypointSize: 250000,
      maxAssetSize: 250000,
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css",
      }),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      new WebpackPwaManifest({
        name: "My Progressive Web App",
        short_name: "MyPWA",
        description: "My awesome Progressive Web App!",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: path.resolve("src/assets/icon.png"),
            sizes: [96, 128, 192, 256, 384, 512],
          },
        ],
      }),
      new GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
      }),
      new CompressionPlugin({
        algorithm: "gzip",
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
      }),
      new ImageminWebpackPlugin({
        pngquant: {
          quality: "95-100",
        },
      }),
    ],
  };

  return merge(
    commonConfig,
    isDevelopment ? developmentConfig : productionConfig,
  );
};
