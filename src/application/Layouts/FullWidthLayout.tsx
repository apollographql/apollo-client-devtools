/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import { useTheme } from "emotion-theming";
import { rem } from "polished";
import { Navigation, NavigationProps } from "./Navigation";

interface FullWidthLayoutProps {
  navigationProps: NavigationProps
  children: any;
};

interface FullWidthLayoutComposition {
  Header: React.FC;
  Main: React.FC;
}

const layoutStyles = css`
  display: grid;
  grid-template-columns: minmax(${rem(460)}, max-content) auto;
  grid-template-areas:
    "nav header header header"
    "main main main main"
`;

const navigationStyles = css`
  grid-area: nav;
`;

const mainStyles = css`
  grid-area: main;
  height: calc(100vh - ${rem(56)});
`;

const headerStyles = css`
  grid-area: header;
`;

const FullWidthLayout: React.FC<FullWidthLayoutProps> & FullWidthLayoutComposition = ({
  navigationProps,
  children,
}) => {
  const { queriesCount, mutationsCount } = navigationProps;

  return (
    <div 
      data-testid="layout" 
      css={layoutStyles}
    >
      <Navigation
        css={navigationStyles}
        queriesCount={queriesCount}
        mutationsCount={mutationsCount}
      />
      {children}
    </div>
  );
};

const Header = ({ children }) => (<div css={headerStyles} data-testid="header">{children}</div>);
const Main = ({ children }) => (<div css={mainStyles} data-testid="main">{children}</div>);

FullWidthLayout.Header = Header;
FullWidthLayout.Main = Main;

export { FullWidthLayout };
