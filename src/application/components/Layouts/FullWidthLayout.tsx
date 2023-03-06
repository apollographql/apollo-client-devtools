import { ReactNode } from "react";
import { css } from "@emotion/react";

import { Navigation, NavigationProps } from "./Navigation";

interface FullWidthLayoutProps {
  navigationProps: NavigationProps;
  children: ReactNode;
  className?: string;
}

const layoutStyles = css`
  display: grid;
  grid-template-columns: 26rem minmax(27rem, auto);
  grid-template-areas:
    "nav header"
    "main main";
`;

const mainStyles = css`
  grid-area: main;
  height: calc(100vh - 2.5rem);
`;

const headerStyles = css`
  grid-area: header;
`;

const FullWidthLayout = ({ navigationProps, children, className }: FullWidthLayoutProps) => {
  const { queriesCount, mutationsCount } = navigationProps;

  return (
    <div data-testid="layout" className={className} css={layoutStyles}>
      <Navigation queriesCount={queriesCount} mutationsCount={mutationsCount} />
      {children}
    </div>
  );
};

interface HeaderProps {
  className?: string
  children?: ReactNode
}

const Header = ({ children, className }: HeaderProps) => (
  <div className={className} css={headerStyles} data-testid="header">
    {children}
  </div>
);

interface MainProps {
  className?: string
  children?: ReactNode
}

const Main = ({ children, className }: MainProps) => (
  <div className={className} css={mainStyles} data-testid="main">
    {children}
  </div>
);

FullWidthLayout.Header = Header;
FullWidthLayout.Main = Main;

export { FullWidthLayout };
