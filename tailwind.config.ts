import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { colors, typography, TextStyle } from "@apollo/brand";

type TailwindTextStyle = { [K in keyof TextStyle]: string };

function mapEntries<T, R>(
  obj: { [key: string]: T },
  mapper: (key: string, value: T) => [key: string, value: R]
) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => mapper(key, value))
  );
}

function replaceValues<T, R>(
  obj: { [key: string]: T },
  mapper: (value: T, key: string) => R
) {
  return mapEntries(obj, (key, value) => [key, mapper(value, key)]);
}

function toUnprefixed<TConfig extends { base: string; [key: string]: unknown }>(
  config: Record<string, TConfig>
) {
  return replaceValues(config, ({ base, ...rest }) => ({
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
    fontSize: replaceValues(typography.primitives.fontSize, (config) => [
      `${config.fontSize}px`,
      String(config.lineHeight),
    ]),
    fontWeight: replaceValues(typography.primitives.fontWeight, String),
    data: {
      "state-active": 'state="active"',
    },
    extend: {
      backgroundColor: {
        ...toUnprefixed(colors.tokens.bg),
        ...mapEntries(colors.tokens.button, (name, { base, ...rest }) => [
          `button-${name}`,
          { ...rest, DEFAULT: base },
        ]),
        highlight: {
          DEFAULT: colors.primitives.yellow[100],
          dark: colors.primitives.yellow[500],
        },
      },
      borderColor: {
        ...toUnprefixed(colors.tokens.border),
        // Fix for neutral colors according to the design file
        neutral: {
          DEFAULT: colors.primitives.gray[400],
          dark: colors.primitives.navy[200],
        },
        transparent: "transparent",
      },
      textColor: {
        ...toUnprefixed(colors.tokens.text),
        ...mapEntries(colors.tokens.icon, (name, { base, ...rest }) => [
          `icon-${name}`,
          { ...rest, DEFAULT: base },
        ]),
      },
    },
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
