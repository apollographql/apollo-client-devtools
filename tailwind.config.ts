import type { Config } from "tailwindcss";
import { colors, typography, fontFamily } from "@apollo/tailwind-preset";
import defaultConfig from "tailwindcss/defaultConfig";
import headlessPlugin from "@headlessui/tailwindcss";

export default {
  content: [
    "./src/extension/devtools/panel.html",
    "./src/application/**/*.{html,ts,tsx}",
  ],
  presets: [defaultConfig, colors, typography, fontFamily.openSource],
  plugins: [headlessPlugin],
  theme: {
    data: {
      "state-active": 'state="active"',
      "state-inactive": 'state="inactive"',
      "orientation-horizontal": 'orientation="horizontal"',
      "orientation-vertical": 'orientation="vertical"',
    },
    extend: {
      borderColor: {
        transparent: "transparent",
      },
      boxShadow: {
        modal:
          "0px 16px 32px 0px rgba(0, 0, 0, 0.12), 0px 0px 0px 0px rgba(18, 21, 26, 0.04)",
        popovers:
          "0px 4px 8px 0px rgba(0, 0, 0, 0.08), 0px 0px 0px 0px rgba(18, 21, 26, 0.04)",
      },
      ringWidth: {
        3: "3px",
      },
      ringOffsetWidth: {
        3: "3px",
      },
      stroke: {
        current: "currentColor",
      },
      width: {
        "modal-sm": "336px",
        "modal-md": "400px",
        "modal-lg": "464px",
        "modal-xl": "528px",
      },
    },
  },
} satisfies Config;
