const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const config = {
  mode: "development",
  devtool: "cheap-module-source-map",
  entry: {
    app: path.join(__dirname, "./static/index.js"),
  },
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "[name].js",
  },
  resolve: {
    extensions: ["*", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Apollo Client Chrome Developer Tools",
      meta: {
        charset: "utf-8",
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
        "theme-color": "#000000",
      },
      manifest: "manifest.json",
      filename: "index.html",
      template: "./static/index.html",
      hash: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"],
      },
    ],
  },
};

module.exports = config;
