import path from "path";
import url from "url";
import CopyPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import WebExtPlugin from "web-ext-plugin";
import { StatsWriterPlugin } from "webpack-stats-plugin";
import webpack from "webpack";
import packageJson from "./package.json" with { type: "json" };

import vscodeClientPkg from "./packages/client-devtools-vscode/package.json" with { type: "json" };

const validExternals = Object.keys(vscodeClientPkg.dependencies).concat(
  Object.keys(vscodeClientPkg.peerDependencies)
);

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const WEB_EXT_TARGETS = {
  chrome: "chromium",
  firefox: "firefox-desktop",
};

export default /** @returns {import("webpack").Configuration} */ (env) => {
  const target = env.TARGET;
  const IS_EXTENSION = target === "chrome" || target === "firefox";
  const IS_VSCODE = target === "vscode";
  const devOptions =
    env.NODE_ENV === "development"
      ? {
          devtool: "inline-source-map",
        }
      : {
          devtool: false,
        };

  const TARGET_DIR = path.resolve(__dirname, env.TARGET_DIR ?? "build");

  if (!target) {
    throw new Error("Must set a `TARGET`");
  }

  /** @type {import("webpack").WebpackPluginInstance[]} */
  const plugins = [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(packageJson.version),
      __IS_FIREFOX__: target === "firefox",
      __IS_CHROME__: target === "chrome",
      __IS_EXTENSION__: IS_EXTENSION,
      __IS_VSCODE__: IS_VSCODE,
    }),
  ];

  if (env.NODE_ENV === "production") {
    plugins.push(
      new StatsWriterPlugin({
        filename: "../webpack-stats.json",
        stats: {
          assets: true,
          chunks: true,
          modules: true,
        },
      })
    );
  }

  if (IS_EXTENSION) {
    plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: "./src/extension/devtools/panel.html",
            to: TARGET_DIR,
          },
          {
            from: "./src/extension/devtools/devtools.html",
            to: TARGET_DIR,
          },
          {
            from: "./src/extension/images",
            to: path.resolve(TARGET_DIR, "images"),
          },
          {
            from: `./src/extension/${target}/manifest.json`,
            to: path.resolve(TARGET_DIR, "manifest.json"),
          },
        ],
      })
    );
  }
  if (env.NODE_ENV === "development" && IS_EXTENSION) {
    plugins.push(
      new WebExtPlugin({
        browserConsole: true,
        runLint: false,
        sourceDir: TARGET_DIR,
        startUrl: "http://localhost:3000",
        target: WEB_EXT_TARGETS[target],
      })
    );
  }

  const base = {
    ...devOptions,
    mode: env.NODE_ENV,
    target: "web",
    entry: IS_VSCODE
      ? { panel: "./src/extension/devtools/panel.ts" }
      : target === "chrome"
        ? {
            service_worker: "./src/extension/service_worker/service_worker.ts",
            panel: "./src/extension/devtools/panel.ts",
            devtools: "./src/extension/devtools/devtools.ts",
            tab: "./src/extension/tab/tab.ts",
            hook: "./src/extension/tab/hook.ts",
          }
        : {
            background: "./src/extension/background/background.ts",
            panel: "./src/extension/devtools/panel.ts",
            devtools: "./src/extension/devtools/devtools.ts",
            tab: "./src/extension/tab/tab.ts",
            hook: "./src/extension/tab/hook.ts",
          },
    output: {
      path: TARGET_DIR,
      filename: "[name].js",
      chunkFormat: "commonjs",
    },
    resolve: {
      extensions: [
        `.${target}.ts`,
        `.${target}.tsx`,
        ".mjs",
        ".js",
        ".ts",
        ".tsx",
        ".css",
      ],
      alias: {
        "@/*": path.resolve(__dirname, "./src/*"),
      },
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
        {
          test: /\.graphql/,
          type: "asset/source",
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
  return [base].concat(
    IS_VSCODE
      ? [
          {
            mode: env.NODE_ENV,
            target: "web",
            entry: {
              "vscode-server": "./src/extension/vscode/server.ts",
              "vscode-client": "./src/extension/vscode/client.ts",
            },
            output: {
              path: TARGET_DIR,
              filename: "[name].js",
              chunkFormat: "module",
              library: {
                type: "module",
              },
            },
            externals: function (ctx, callback) {
              if (ctx.request.startsWith(".") || ctx.request.startsWith("@/")) {
                // inline
                return callback();
              }
              if (ctx.request.startsWith("@apollo/client-3")) {
                throw new Error(
                  "Introducing a runtime dependency on AC3 should be avoided. Please inline any required code instead. Tried to import " +
                    ctx.request
                );
              }
              if (ctx.request.startsWith("@apollo/client")) {
                throw new Error(
                  "Introducing a runtime dependency on AC4 should be avoided. Please inline any required code instead. Tried to import " +
                    ctx.request
                );
              }
              if (validExternals.includes(ctx.request)) {
                // treat as external
                return callback(null, ctx.request, "module");
              }
              throw new Error(
                `Invalid external import: ${ctx.request}. Valid externals are: ${validExternals.join(",")}`
              );
            },
            experiments: {
              outputModule: true,
            },
            resolve: base.resolve,
            module: base.module,
            devtool: base.devtool,
            optimization: { minimize: false },
            plugins: [
              new CopyPlugin({
                patterns: [
                  {
                    from: "./LICENSE",
                    to: path.resolve(__dirname, "build", "LICENSE.md"),
                  },
                ],
              }),
            ],
          },
        ]
      : []
  );
};
