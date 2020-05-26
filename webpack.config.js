const path = require("path");
const webpack = require("webpack");
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
  devtool:
    process.env.NODE_ENV === "production" ? "source-map" : "eval-source-map",
  entry: {
    hook: "./src/extension/tab/install-hook.js",
    panel: "./src/extension/devtools/panel.js",
    background: "./src/extension/background/background.js",
    devtools: "./src/extension/devtools/devtools.js",
    backend: "./src/extension/tab/backend.js",
    proxy: "./src/extension/tab/proxy.js",
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].js",
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
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /(node_modules)/,
      },
    ],
  },
  plugins: plugins,
};
