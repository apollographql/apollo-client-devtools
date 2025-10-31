import JsonView from "@uiw/react-json-view";
import { colors } from "@apollo/brand";
import { ColorTheme, colorTheme } from "../theme";
import { useReactiveVar } from "@apollo/client/react";
import type { ReactNode } from "react";
import { useMemo } from "react";

interface Props<TValue extends object> {
  children?: ReactNode;
  value: TValue;
}

type Theme = Record<string, string | { base: string; dark: string }>;

const { border, code, text, icon } = colors.tokens;

const THEME: Theme = {
  "--w-rjv-arrow-color": icon.primary,
  "--w-rjv-brackets-color": code.a,
  "--w-rjv-colon-color": "var(--w-rjv-brackets-color)",
  "--w-rjv-curlybraces-color": "var(--w-rjv-brackets-color)",
  "--w-rjv-ellipsis-color": text.disabled,
  "--w-rjv-info-color": code.f,
  "--w-rjv-key-string": code.d,
  "--w-rjv-key-number": "var(--w-rjv-key-string)",
  "--w-rjv-line-color": border.primary,
  "--w-rjv-quotes-color": "var(--w-rjv-key-string)",
  "--w-rjv-quotes-string-color": "var(--w-rjv-type-string-color)",
  "--w-rjv-type-bigint-color": "var(--w-rjv-type-int-color)",
  "--w-rjv-type-boolean-color": code.c,
  "--w-rjv-type-int-color": code.c,
  "--w-rjv-type-float-color": "var(--w-rjv-type-int-color)",
  "--w-rjv-type-nan-color": "var(--w-rjv-type-int-color)",
  "--w-rjv-type-null-color": text.secondary,
  "--w-rjv-type-string-color": code.g,
  "--w-rjv-type-undefined-color": "var(--w-rjv-type-null-color)",
};

export function JSONView<TValue extends object>({
  children,
  value,
}: Props<TValue>) {
  const colorKey =
    useReactiveVar(colorTheme) === ColorTheme.Dark ? "dark" : "base";

  const theme = useMemo(() => {
    return Object.fromEntries(
      Object.entries(THEME).map(([key, token]) => [
        key,
        typeof token === "string" ? token : token[colorKey],
      ])
    );
  }, [colorKey]);

  return (
    <JsonView value={value} style={theme} displayDataTypes={false}>
      <JsonView.Null render={(props) => <span {...props}>null</span>} />
      <JsonView.Undefined
        render={(props) => <span {...props}>undefined</span>}
      />
      {children}
    </JsonView>
  );
}
