import path from "path";
import url from "url";
import CopyPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import WebExtPlugin from "web-ext-plugin";
import webpack from "webpack";
import packageJson from "./package.json" with { type: "json" };

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

  if (IS_EXTENSION) {
    plugins.push(
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
      })
    );
  }
  if (env.NODE_ENV === "development" && IS_EXTENSION) {
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
      path: path.join(__dirname, "build"),
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
              path: path.join(__dirname, "build"),
              filename: "[name].js",
              chunkFormat: "module",
              library: {
                type: "module",
              },
            },
            externals: function (ctx, callback) {
              if (ctx.request.startsWith(".")) {
                return callback();
              }
              if (ctx.request.startsWith("@apollo/client")) {
                return callback(null, ctx.request + "/index.js", "module");
              }
              callback(null, ctx.request, "module");
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
                    from: "./dist/src/extension/vscode/server.d.ts",
                    to: path.resolve(__dirname, "build", "vscode-server.d.ts"),
                  },
                  {
                    from: "./dist/src/extension/vscode/client.d.ts",
                    to: path.resolve(__dirname, "build", "vscode-client.d.ts"),
                  },
                  {
                    from: "./package.vscode.json",
                    to: path.resolve(__dirname, "build", "package.json"),
                  },
                  {
                    from: "./README.vscode.md",
                    to: path.resolve(__dirname, "build", "README.md"),
                  },
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
