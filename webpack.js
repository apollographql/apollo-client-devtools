const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const config = {
  mode: "development",
  devtool: "cheap-module-source-map",
  entry: {
    "environment/environment": "./src/environment/index.ts",
    "injected/injected": "./src/injected/injected.ts",
    "app/app": "./src/app/index.js",
  },
  output: {
    path: path.resolve(__dirname, "./build"),
  },
  resolve: {
    extensions: ["*", ".js", ".ts", ".tsx"],
  },
  plugins: [
    new CopyPlugin([
      {
        from: "./manifest.json",
        to: "",
      },

      // Environment
      {
        from: "./src/environment/index.html",
        to: "./environment",
      },

      // App
      {
        from: "./src/app/index.html",
        to: "./app",
      },
      {
        from: "./src/app/icons",
        to: "./app/icons",
      },
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader?modules"],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: {
          loader: "file-loader",
          options: {
            outputPath: "./app",
            publicPath: "./",
          },
        },
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};

module.exports = config;
