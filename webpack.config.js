const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const WebExtPlugin = require("./WebExtPlugin");

module.exports = (env) => {
  const devOptions = (env.NODE_ENV === "development") ? {
    "devtool": "inline-source-maps",
  } : {};

  const plugins = [
    new CopyPlugin({
      patterns: [
        {
          from: "./src/extension/devtools/panel.html",
          to: path.resolve(__dirname, "build")
        },
        {
          from: "./src/extension/devtools/devtools.html",
          to: path.resolve(__dirname, "build")
        },
        {
          from: "./src/extension/images",
          to: path.resolve(__dirname, "build/images")
        },
        {
          from: "./src/extension/manifest.json",
          to: path.resolve(__dirname, "build")
        }
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
      hook: "./src/extension/tab/install-hook.js",
      panel: "./src/extension/devtools/panel.js",
      background: "./src/extension/background/background.js",
      devtools: "./src/extension/devtools/devtools.js",
      backend: "./src/extension/tab/backend.ts",
      proxy: "./src/extension/tab/proxy.js",
    },
    output: {
      path: path.join(__dirname, "build"),
      filename: "[name].js",
    },
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".tsx"]
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
          test: /\.(ts|js)x?$/,
          exclude: /(node_modules)/,
          use: [
            {
              loader: "babel-loader"
            },
          ],
        },
      ],
    },
    optimization: {
      minimize: (env.NODE_ENV === "production"),
      minimizer: [
        new TerserPlugin({
          sourceMap: (env.NODE_ENV === "development"),
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
