import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { colors, typography, TextStyle } from "@apollo/brand";

type TailwindTextStyle = { [K in keyof TextStyle]: string };

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

const fonts = {
  body: "Inter, sans-serif",
  heading: "Inter, sans-serif",
  code: "'Fira Code', monospace",
};

export default {
  content: [
    "./src/extension/devtools/panel.html",
    "./src/application/**/*.{html,ts,tsx}",
  ],
  theme: {
    fontFamily: fonts,
    colors: colors.primitives,
    backgroundColor: toUnprefixed(colors.tokens.bg),
    borderColor: toUnprefixed(colors.tokens.border),
    textColor: toUnprefixed(colors.tokens.text),
    fontSize: mapEntries(typography.primitives.fontSize, (config) => [
      `${config.fontSize}px`,
      String(config.lineHeight),
    ]),
    fontWeight: mapEntries(typography.primitives.fontWeight, String),
    extend: {},
  },
  plugins: [
    plugin(({ addComponents }) => {
      const typographyClasses = Object.fromEntries(
        Object.entries(typography.tokens).map(([key, config]) => {
          return [
            key === "base" ? ".prose" : `.prose-${key}`,
            {
              fontFamily: fonts[config.fontFamily],
              fontWeight: String(config.fontWeight),
              fontSize: `${config.fontSize}px`,
              lineHeight: String(config.lineHeight),
            } satisfies TailwindTextStyle,
          ];
        })
      );

      addComponents(typographyClasses);
    }),
  ],
} satisfies Config;
