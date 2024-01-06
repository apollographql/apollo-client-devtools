import { ComponentPropsWithoutRef } from "react";
import { useReactiveVar } from "@apollo/client";
import { JSONTree } from "react-json-tree";
import { ColorTheme, colorTheme } from "../theme";
import { colors, ShadedColor } from "@apollo/space-kit/colors";

type JSONTreeProps = ComponentPropsWithoutRef<typeof JSONTree>;

type JSONTreeViewerProps = Pick<
  JSONTreeProps,
  "data" | "hideRoot" | "valueRenderer"
>;

// The Base16 options used below are explained here:
// https://github.com/chriskempson/base16/blob/7fa89d33bc77a43e1cf93c4654b235e21f827ce3/styling.md
const theme: Record<ColorTheme, Record<string, string>> = {
  [ColorTheme.Light]: {
    base00: colors.white as ShadedColor,
    base01: colors.white as ShadedColor,
    base02: "#FFFF00" as ShadedColor,
    base03: "#969896" as ShadedColor,
    base04: colors.white as ShadedColor,
    base05: colors.white as ShadedColor,
    base06: colors.white as ShadedColor,
    base07: colors.white as ShadedColor,
    base08: colors.grey.base,
    base09: colors.indigo.base,
    base0A: colors.black.base,
    base0B: colors.pink.dark,
    base0C: colors.black.base,
    base0D: colors.black.base,
    base0E: colors.black.base,
    base0F: colors.black.base,
  },
  [ColorTheme.Dark]: {
    base00: "#23262d" as ShadedColor,
    base01: colors.white as ShadedColor,
    base02: "#FFFF00" as ShadedColor,
    base03: "#969896" as ShadedColor,
    base04: colors.white as ShadedColor,
    base05: colors.white as ShadedColor,
    base06: colors.white as ShadedColor,
    base07: colors.white as ShadedColor,
    base08: colors.grey.base,
    base09: colors.indigo.light,
    base0A: colors.white as ShadedColor,
    base0B: colors.pink.light,
    base0C: colors.white as ShadedColor,
    base0D: colors.white as ShadedColor,
    base0E: colors.white as ShadedColor,
    base0F: colors.white as ShadedColor,
  },
};

export function JSONTreeViewer(props: JSONTreeViewerProps) {
  const activeTheme = theme[useReactiveVar(colorTheme)];

  return <JSONTree {...props} invertTheme={false} theme={activeTheme} />;
}
