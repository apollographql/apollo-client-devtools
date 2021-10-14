/* eslint-disable */
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const WebExtPlugin = require("./WebExtPlugin");
/* eslint-enable */

module.exports = (env) => {
  const devOptions =
    env.NODE_ENV === "development"
      ? {
          devtool: "inline-source-map",
        }
      : {};

  const plugins = [
    new CopyPlugin({
      patterns: [
        {
          from: "./src/extension/devtools/panel.html",
          to: path.resolve(__dirname, "build"),
        },
        {
          from: "./src/extension/devtools/devtools.html",
          to: path.resolve(__dirname, "build"),
        },
        {
          from: "./src/extension/images",
          to: path.resolve(__dirname, "build/images"),
        },
        {
          from: "./src/extension/manifest.json",
          to: path.resolve(__dirname, "build"),
        },
      ],
    }),
  ];

  if (env.NODE_ENV === "development") {
    plugins.push(new WebExtPlugin({ target: env.TARGET }));
  }

  return {
    ...devOptions,
    mode: env.NODE_ENV,
    entry: {
      panel: "./src/extension/devtools/panel.ts",
      background: "./src/extension/background/background.ts",
      devtools: "./src/extension/devtools/devtools.ts",
      tab: "./src/extension/tab/tab.ts",
      hook: "./src/extension/tab/hook.ts",
    },
    output: {
      path: path.join(__dirname, "build"),
      filename: "[name].js",
    },
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".tsx", ".css"],
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.(ts)x?$/,
          loader: "ts-loader",
        },
      ],
    },
    optimization: {
      minimize: env.NODE_ENV === "production",
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ],
    },
    plugins,
  };
};
