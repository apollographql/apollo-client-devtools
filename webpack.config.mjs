import path from "path";
import url from "url";
import CopyPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import WebExtPlugin from "web-ext-plugin";
import webpack from "webpack";
import packageJson from "./package.json" assert { type: "json" };

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export default (env) => {
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
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(packageJson.version),
    }),
  ];

  if (env.NODE_ENV === "development") {
    plugins.push(
      new WebExtPlugin({
        browserConsole: true,
        runLint: false,
        sourceDir: path.resolve(__dirname, "build"),
        startUrl: "http://localhost:3000",
        target: env.TARGET,
      })
    );
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
          use: ["style-loader", "css-loader", "postcss-loader"],
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
