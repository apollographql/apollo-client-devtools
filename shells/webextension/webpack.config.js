const path = require("path");
const webpack = require("webpack");
const alias = require("../alias");
const UglifyPlugin = require("uglifyjs-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const plugins = [new webpack.IgnorePlugin(/\.flow$/)];
if (process.env.NODE_ENV === "production") {
  plugins.push(
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
      },
    }),
  );
  plugins.push(new UglifyPlugin());
} else {
  plugins.push(new BundleAnalyzerPlugin());
}

module.exports = {
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
    loaders: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader",
      },
      {
        test: /\.json$/,
        loader: "json-loader",
      },
      {
        test: /\.less$/,
        loader: "style-loader!css-loader!less-loader",
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /(node_modules)/,
        options: {
          configFile: path.resolve(__dirname, "./../../.babelrc"),
        },
      },
    ],
  },
  plugins: plugins,
};
