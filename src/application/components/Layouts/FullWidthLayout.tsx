/** @jsx jsx */

import React from "react";
import { jsx, css } from "@emotion/react";

import { Navigation, NavigationProps } from "./Navigation";

interface FullWidthLayoutProps {
  navigationProps: NavigationProps;
  children: any;
  className?: string;
}

interface FullWidthLayoutComposition {
  Header: React.FC;
  Main: React.FC;
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
  height: 100vh;
`;

const headerStyles = css`
  grid-area: header;
`;

const FullWidthLayout: React.FC<FullWidthLayoutProps> &
  FullWidthLayoutComposition = ({ navigationProps, children, className }) => {
  const { queriesCount, mutationsCount } = navigationProps;

  return (
    <div data-testid="layout" className={className} css={layoutStyles}>
      <Navigation queriesCount={queriesCount} mutationsCount={mutationsCount} />
      {children}
    </div>
  );
};

const Header = ({ children, className }) => (
  <div className={className} css={headerStyles} data-testid="header">
    {children}
  </div>
);

const Main = ({ children, className }) => (
  <div className={className} css={mainStyles} data-testid="main">
    {children}
  </div>
);

FullWidthLayout.Header = Header;
FullWidthLayout.Main = Main;

export { FullWidthLayout };
