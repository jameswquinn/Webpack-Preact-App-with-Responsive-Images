const path = require("path");
const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");
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
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const PATHS = {
  src: path.join(__dirname, "src"),
};

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
      publicPath: "/",
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      alias: {
        "@": path.resolve(__dirname, "src"),
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
                ["@babel/preset-env", { useBuiltIns: "usage", corejs: 3 }],
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
            {
              loader: "css-loader",
              options: {
                importLoaders: 2,
                modules: {
                  auto: true,
                  localIdentName: isDevelopment
                    ? "[name]__[local]--[hash:base64:5]"
                    : "[hash:base64]",
                },
              },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    !isDevelopment &&
                      new PurgeCSSPlugin({
                        paths: pathsToPurge,
                        safelist: {
                          standard: [/^some-regex-to-keep$/],
                          deep: [/^some-deep-regex-to-keep/],
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
          test: /\.(png|jpe?g|webp)$/i,
          use: [
            {
              loader: "responsive-loader",
              options: {
                adapter: require("responsive-loader/sharp"),
                sizes: [320, 640, 960, 1200, 1800, 2400],
                placeholder: true,
                placeholderSize: 20,
                name: isDevelopment
                  ? "[name]-[width].[ext]"
                  : "[name]-[width]-[hash:8].[ext]",
                format: "webp",
                quality: 80,
              },
            },
          ],
        },
        {
          test: /\.(gif|svg)$/i,
          type: "asset",
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            },
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        minify: !isDevelopment,
      }),
      new FaviconsWebpackPlugin({
        logo: "./src/assets/icon.png",
        mode: "webapp",
        devMode: "webapp",
        favicons: {
          appName: "My PWA",
          appDescription: "My awesome Progressive Web App!",
          developerName: "Developer",
          developerURL: null,
          background: "#ffffff",
          theme_color: "#000000",
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
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: [
                ["gifsicle", { interlaced: true }],
                ["mozjpeg", { quality: 80 }],
                ["pngquant", { quality: [0.6, 0.8] }],
                ["svgo", { plugins: [{ removeViewBox: false }] }],
              ],
            },
          },
        }),
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
            purpose: "any maskable",
          },
        ],
      }),
      new GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          },
        ],
      }),
      new CompressionPlugin({
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
        reportFilename: "bundle-report.html",
      }),
    ],
  };

  return merge(
    commonConfig,
    isDevelopment ? developmentConfig : productionConfig,
  );
};
