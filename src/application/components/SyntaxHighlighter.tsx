import Highlight, { 
  defaultProps,
  Language,
  PrismTheme,
} from "prism-react-renderer";
import { colors } from '@apollo/space-kit/colors';

interface SyntaxHighlighterProps {
  className?: string;
  language: Language;
  code: string;
}

const theme: PrismTheme = {
  plain: {
    color: 'currentColor',
    backgroundColor: 'transparent',
  },
  styles: [
    {
      types: ['important', 'bold'],
      style: {
        fontWeight: 'bold'
      }
    },
    {
      types: ['italic'],
      style: {
        fontStyle: 'italic'
      }
    },
    {
      types: ['entity'],
      style: {
        cursor: 'help'
      }
    },
    {
      types: ['selector', 'attr-name', 'char', 'builtin', 'inserted'],
      style: {
        color: colors.teal.light,
      }
    },
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {
        color: colors.orange.light,
        fontWeight: 'bold'
      }
    },
    {
      types: ['punctuation'],
      style: {
        color: colors.grey.light,
      }
    },
    {
      types: [
        'property',
        'tag',
        'boolean',
        'number',
        'constant',
        'symbol',
        'deleted',
        'class-name',
        'function'
      ],
      style: {
        color: colors.pink.light,
      }
    },
    {
      types: ['atrule', 'attr-value', 'keyword'],
      style: {
        color: 'inherit',
        background: 'transparent'
      }
    },
    {
      types: ['atrule', 'attr-value', 'keyword'],
      style: {
        color: colors.indigo.light,
      }
    },
    {
      types: ['regex', 'important', 'variable', 'description'],
      style: {
        color: colors.yellow.light,
      }
    }
  ]
};

const SyntaxHighlighter = ({ 
  code,
  className: outerClassName,
  language,
}: SyntaxHighlighterProps) => {
  return (
    <Highlight
      {...defaultProps}
      language={language} 
      theme={theme}
      code={code}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => {
        return (
          <pre 
            className={[className, outerClassName].filter(Boolean).join(' ')} 
            style={style}
          >
            <code>
              {tokens.map((line, index) => {
                return (
                  <div key={index} {...getLineProps({ line, key: index })}>
                    {line.map((token, key) => {
                      return <span key={key} {...getTokenProps({ token, key })} />
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

export default SyntaxHighlighter;
