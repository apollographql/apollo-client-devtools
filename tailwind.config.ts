import type { Config } from "tailwindcss";
import { colors } from "@apollo/brand";

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
    extend: {},
  },
  plugins: [],
} satisfies Config;
