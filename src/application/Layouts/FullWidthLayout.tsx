/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import { rem } from "polished";
import { Navigation, NavigationProps } from "./Navigation";

interface FullWidthLayoutProps {
  navigationProps: NavigationProps
  children: any;
  className?: string;
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
  className,
}) => {
  const { queriesCount, mutationsCount } = navigationProps;

  return (
    <div 
      data-testid="layout" 
      className={className}
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

const Header = ({ children, className }) => (<div className={className} css={headerStyles} data-testid="header">{children}</div>);
const Main = ({ children, className }) => (<div className={className} css={mainStyles} data-testid="main">{children}</div>);

FullWidthLayout.Header = Header;
FullWidthLayout.Main = Main;

export { FullWidthLayout };
