import {
  useMemo,
  type CSSProperties,
  type ComponentPropsWithoutRef,
} from "react";
import { useReactiveVar } from "@apollo/client/react";
import { JSONTree } from "react-json-tree";
import { ColorTheme, colorTheme } from "../theme";
import { colors } from "@apollo/brand";
import { clsx } from "clsx";
import type { Base16Theme } from "react-base16-styling";

type JSONTreeProps = ComponentPropsWithoutRef<typeof JSONTree>;

type JSONTreeViewerProps = Pick<
  JSONTreeProps,
  | "data"
  | "hideRoot"
  | "valueRenderer"
  | "keyPath"
  | "shouldExpandNodeInitially"
> & {
  className?: string;
  style?: CSSProperties;
  theme?: keyof typeof THEMES;
};

// The Base16 options used below are explained here:
// https://github.com/chriskempson/base16/blob/7fa89d33bc77a43e1cf93c4654b235e21f827ce3/styling.md
type Theme = {
  [K in keyof Base16Theme as K extends `base${string}` ? K : never]: {
    base: string;
    dark: string;
  };
};

const { bg, code, icon, text } = colors.tokens;
const { primitives } = colors;

const whiteToken = { base: primitives.white, dark: primitives.white };

const THEMES = {
  codeBlock: {
    base00: bg.primary,
    base01: bg.secondary,
    base02: bg.selected,
    base03: code.b,
    base04: whiteToken,
    base05: icon.primary,
    base06: whiteToken,
    base07: whiteToken,
    base08: code.a,
    base09: code.c,
    base0A: code.a,
    base0B: code.g,
    base0C: code.f,
    base0D: code.d,
    base0E: code.d,
    base0F: code.b,
  },
  alertError: {
    base00: { base: "transparent", dark: "transparent" },
    base01: bg.secondary,
    base02: bg.selected,
    base03: code.g,
    base04: whiteToken,
    base05: icon.primary,
    base06: whiteToken,
    base07: whiteToken,
    base08: code.a,
    base09: code.g,
    base0A: code.a,
    base0B: code.g,
    base0C: code.a,
    base0D: text.error,
    base0E: code.a,
    base0F: text.error,
  },
} as const satisfies Record<string, Theme>;

export function JSONTreeViewer({
  className,
  style,
  theme: themeName = "codeBlock",
  ...props
}: JSONTreeViewerProps) {
  const colorKey =
    useReactiveVar(colorTheme) === ColorTheme.Dark ? "dark" : "base";

  const activeTheme = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(THEMES[themeName]).map(([key, token]) => [
          key,
          token[colorKey],
        ])
      ),
    [colorKey, themeName]
  );

  return (
    <JSONTree
      {...props}
      invertTheme={false}
      theme={{
        extend: activeTheme,
        tree: ({ style: defaultStyle }) => ({
          className: clsx("font-code", className),
          style: {
            ...defaultStyle,
            margin: 0,
            ...style,
          },
        }),
      }}
    />
  );
}
