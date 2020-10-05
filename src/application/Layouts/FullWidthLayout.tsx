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

const layout = css`
  display: grid;
  grid-template-columns: minmax(${rem(460)}, max-content) auto;
  grid-template-areas:
    "nav header header header"
    "main main main main"
`;

const navigation = css`
  grid-area: nav;
`;

const main = css`
  grid-area: main;
  height: calc(100vh - ${rem(49)});
`;

const header = css`
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
      css={layout}
    >
      <Navigation
        css={navigation}
        queriesCount={queriesCount}
        mutationsCount={mutationsCount}
      />
      {children}
    </div>
  );
};

const Header = ({ children }) => (<div css={header} data-testid="header">{children}</div>);
const Main = ({ children }) => (<div css={main} data-testid="main">{children}</div>);

FullWidthLayout.Header = Header;
FullWidthLayout.Main = Main;

export { FullWidthLayout };
