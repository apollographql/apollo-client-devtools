import path from "path";
import url from "url";
import CopyPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import WebExtPlugin from "web-ext-plugin";
import webpack from "webpack";
import packageJson from "./package.json" assert { type: "json" };

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const WEB_EXT_TARGETS = {
  chrome: "chromium",
  firefox: "firefox-desktop",
};

export default /** @returns {import("webpack").Configuration} */ (env) => {
  const target = env.TARGET;
  const devOptions =
    env.NODE_ENV === "development"
      ? {
          devtool: "inline-source-map",
        }
      : {};

  if (!target) {
    throw new Error("Must set a `TARGET`");
  }

  /** @type {import("webpack").WebpackPluginInstance[]} */
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
          from: `./src/extension/${target}/manifest.json`,
          to: path.resolve(__dirname, "build/manifest.json"),
        },
      ],
    }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(packageJson.version),
      __IS_FIREFOX__: target === "firefox",
    }),
  ];

  if (env.NODE_ENV === "development") {
    plugins.push(
      new WebExtPlugin({
        browserConsole: true,
        runLint: false,
        sourceDir: path.resolve(__dirname, "build"),
        startUrl: "http://localhost:3000",
        target: WEB_EXT_TARGETS[target],
      })
    );
  }

  const entry =
    target === "chrome"
      ? { service_worker: "./src/extension/service_worker/service_worker.ts" }
      : { background: "./src/extension/background/background.ts" };

  return {
    ...devOptions,
    mode: env.NODE_ENV,
    target: "web",
    entry: {
      panel: "./src/extension/devtools/panel.ts",
      devtools: "./src/extension/devtools/devtools.ts",
      tab: "./src/extension/tab/tab.ts",
      hook: "./src/extension/tab/hook.ts",
      ...entry,
    },
    output: {
      path: path.join(__dirname, "build"),
      filename: "[name].js",
      chunkFormat: "commonjs",
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
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ["@svgr/webpack"],
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
