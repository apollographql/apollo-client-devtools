import type { Config } from "tailwindcss";
import { colors, typography } from "@apollo/brand";

function mapEntries<T, R>(
  obj: { [key: string]: T },
  mapper: (value: T, key: string) => R
) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, mapper(value, key)])
  );
}

function toUnprefixed<TConfig extends { base: string; [key: string]: unknown }>(
  config: Record<string, TConfig>
) {
  return mapEntries(config, ({ base, ...rest }) => ({
    DEFAULT: base,
    ...rest,
  }));
}

export default {
  content: [
    "./src/extension/devtools/panel.html",
    "./src/application/**/*.{html,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      body: ["Inter", "sans-serif"],
      heading: ["Inter", "sans-serif"],
      code: ["'Fira Code'", "monospace"],
    },
    colors: colors.primitives,
    backgroundColor: toUnprefixed(colors.tokens.bg),
    borderColor: toUnprefixed(colors.tokens.border),
    textColor: toUnprefixed(colors.tokens.text),
    fontSize: mapEntries(typography.primitives.fontSize, (config) => [
      `${config.fontSize}px`,
      `${config.lineHeight}px`,
    ]),
    fontWeight: mapEntries(typography.primitives.fontWeight, String),
    extend: {},
  },
  plugins: [],
} satisfies Config;
