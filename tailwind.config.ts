import type { Config } from "tailwindcss";
import { colors, typography } from "@apollo/brand";

function mapEntries<T, R>(
  obj: { [key: string]: T },
  mapper: (key: string, value: T) => R
) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, mapper(key, value)])
  );
}

export default {
  content: [
    "./src/extension/devtools/panel.html",
    "./src/application/**/*.{html,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      monospace: ["Fira Code", "monospace"],
    },
    colors: colors.primitives,
    backgroundColor: colors.tokens.bg,
    borderColor: colors.tokens.border,
    textColor: colors.tokens.text,
    fontSize: mapEntries(typography.primitives.fontSize, (name, config) => [
      `${config.fontSize}px`,
      `${config.lineHeight}px`,
    ]),
    extend: {},
  },
  plugins: [],
} satisfies Config;
