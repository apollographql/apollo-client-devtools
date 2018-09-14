const path = require("path");
const webpack = require("webpack");
const alias = require("../alias");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const plugins = [new webpack.IgnorePlugin(/\.flow$/)];
if (process.env.NODE_ENV !== "production") {
  plugins.push(new BundleAnalyzerPlugin());
}

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    hook: "./src/hook.js",
    devtools: "./src/devtools.js",
    background: "./src/background.js",
    "devtools-background": "./src/devtools-background.js",
    backend: "./src/backend.js",
    proxy: "./src/proxy.js",
    // detector: "./src/detector.js",
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    alias,
    extensions: [".wasm", ".mjs", ".js", ".json", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader",
      },
      {
        test: /\.less$/,
        loader: "style-loader!css-loader!less-loader",
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          configFile: path.resolve(__dirname, "./../../.babelrc"),
        },
      },
    ],
  },
  plugins: plugins,
};
