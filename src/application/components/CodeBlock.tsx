import { Highlight, Language, PrismTheme } from "prism-react-renderer";
import { useReactiveVar } from "@apollo/client";
import { colors } from "@apollo/brand";
import { ColorTheme, colorTheme } from "../theme";

interface SyntaxHighlighterProps {
  className?: string;
  language: Language;
  code: string;
}

const { code } = colors.tokens;

const getTheme = (mode: ColorTheme): PrismTheme => {
  const isDark = mode === ColorTheme.Dark;

  return {
    plain: {
      color: "currentColor",
      backgroundColor: "transparent",
    },
    styles: [
      {
        types: ["important", "bold"],
        style: {
          fontWeight: "bold",
        },
      },
      {
        types: ["italic"],
        style: {
          fontStyle: "italic",
        },
      },
      {
        types: ["entity"],
        style: {
          cursor: "help",
        },
      },
      {
        types: ["selector", "attr-name", "char", "builtin", "inserted"],
        style: {
          color: isDark ? code.d.dark : code.d.base,
        },
      },
      {
        types: ["comment", "prolog", "doctype", "cdata"],
        style: {
          color: isDark ? code.b.dark : code.b.base,
          fontWeight: "bold",
        },
      },
      {
        types: ["scalar", "attr-value"],
        style: {
          color: isDark ? code.c.dark : code.c.base,
        },
      },
      {
        types: ["url", "attr-value"],
        style: {
          color: isDark ? code.g.dark : code.g.base,
        },
      },
      {
        types: ["punctuation", "constant"],
        style: {
          color: isDark ? code.a.dark : code.a.base,
        },
      },
      {
        types: ["property", "tag", "boolean", "number", "symbol"],
        style: {
          color: isDark ? code.c.dark : code.c.base,
        },
      },
      {
        types: ["class-name"],
        style: {
          color: isDark ? code.a.dark : code.a.base,
        },
      },
      {
        types: ["property", "function"],
        style: {
          color: isDark ? code.d.dark : code.d.base,
        },
      },
      {
        types: ["atrule", "attr-value", "keyword"],
        style: {
          color: "inherit",
          background: "transparent",
        },
      },
      {
        types: ["atrule", "attr-value", "keyword"],
        style: {
          color: isDark ? code.b.dark : code.b.base,
        },
      },
      {
        types: ["string"],
        style: {
          color: isDark ? code.g.dark : code.g.base,
        },
      },
      {
        types: [
          "regex",
          "important",
          "variable",
          "description",
          "comment",
          "prolog",
          "doctype",
          "cdata",
        ],
        style: {
          color: isDark ? code.f.dark : code.f.base,
        },
      },
    ],
  };
};

export const CodeBlock = ({
  code,
  className: outerClassName,
  language,
}: SyntaxHighlighterProps) => {
  const activeTheme = getTheme(useReactiveVar(colorTheme));

  return (
    <Highlight language={language} theme={activeTheme} code={code}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => {
        return (
          <pre
            className={[className, outerClassName].filter(Boolean).join(" ")}
            style={style}
          >
            <code>
              {tokens.map((line, index) => {
                return (
                  <div key={index} {...getLineProps({ line, key: index })}>
                    {line.map((token, key) => {
                      return (
                        <span key={key} {...getTokenProps({ token, key })} />
                      );
                    })}
                  </div>
                );
              })}
            </code>
          </pre>
        );
      }}
    </Highlight>
  );
};
