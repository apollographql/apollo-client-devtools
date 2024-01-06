import { ComponentPropsWithoutRef } from "react";
import { useReactiveVar } from "@apollo/client";
import { JSONTree } from "react-json-tree";
import { ColorTheme, colorTheme } from "../theme";
import { colors } from "@apollo/brand";

type JSONTreeProps = ComponentPropsWithoutRef<typeof JSONTree>;

type JSONTreeViewerProps = Pick<
  JSONTreeProps,
  "data" | "hideRoot" | "valueRenderer"
>;

const { bg, code, icon } = colors.tokens;
const { primitives } = colors;

// The Base16 options used below are explained here:
// https://github.com/chriskempson/base16/blob/7fa89d33bc77a43e1cf93c4654b235e21f827ce3/styling.md
const getTheme = (theme: ColorTheme) => {
  const isDark = theme === ColorTheme.Dark;

  return {
    base00: isDark ? bg.primary.dark : bg.primary.base,
    base01: isDark ? bg.secondary.dark : bg.secondary.base,
    base02: isDark ? bg.selected.dark : bg.selected.base,
    base03: isDark ? code.b.dark : code.b.base,
    base04: primitives.white,
    base05: isDark ? icon.primary.dark : icon.primary.base,
    base06: primitives.white,
    base07: primitives.white,
    base08: isDark ? code.a.dark : code.a.base,
    base09: isDark ? code.c.dark : code.c.base,
    base0A: isDark ? code.a.dark : code.a.base,
    base0B: isDark ? code.g.dark : code.g.base,
    base0C: isDark ? code.f.dark : code.f.base,
    base0D: isDark ? code.d.dark : code.d.base,
    base0E: isDark ? code.d.dark : code.d.base,
    base0F: isDark ? code.b.dark : code.b.base,
  };
};

export function JSONTreeViewer(props: JSONTreeViewerProps) {
  const activeTheme = getTheme(useReactiveVar(colorTheme));

  return (
    <div className="font-code">
      <JSONTree {...props} invertTheme={false} theme={activeTheme} />
    </div>
  );
}
