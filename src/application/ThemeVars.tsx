import { useMemo } from "react";
import { css, Global } from "@emotion/react";

import { ColorTheme, Mode, themes } from "./theme";

const stringifyTheme = (colorTheme: ColorTheme) => {
  const theme = themes[colorTheme];
  return Object.keys(theme)
    .map((key) => `--${key}: ${theme[key]};`)
    .join("");
};

export const Theme = () => {
  const darkTheme = useMemo(() => stringifyTheme(ColorTheme.Dark), []);
  const lightTheme = useMemo(() => stringifyTheme(ColorTheme.Light), []);

  return (
    <Global
      styles={css`
        @media ${Mode.Dark} {
          :root {
            ${darkTheme}
          }
        }

        @media ${Mode.Light} {
          :root {
            ${lightTheme}
          }
        }
      `}
    />
  );
};
