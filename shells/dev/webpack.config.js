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
    backend: "./src/backend.js",
    target: "./target/index.js",
  },
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/dist/",
    filename: "[name].js",
  },
  resolve: { alias },
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
