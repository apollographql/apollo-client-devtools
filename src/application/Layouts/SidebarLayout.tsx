/** @jsx jsx */
import { ReactNode } from "react";
import { jsx, css } from "@emotion/core";
import { rem } from "polished";
import { colors } from "@apollo/space-kit/colors";
import { Navigation, NavigationProps } from "./Navigation";

interface SidebarLayoutProps {
  navigationProps: NavigationProps
  children: any;
};

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

interface SidebarLayoutComposition {
  Sidebar: React.FC<SidebarProps>;
  Header: React.FC;
  Main: React.FC;
}

const layoutStyles = css`
  display: grid;
  grid-template-columns: minmax(${rem(460)}, max-content) auto;
  grid-template-rows: ${rem(56)} auto;
  grid-template-areas:
    "nav header header header"
    "sidebar main main main"
`;

const sidebarStyles = css`
  grid-area: sidebar;
  height: calc(100vh - ${rem(56)});
  padding: ${rem(16)};
  background-color: var(--primary);
  overflow-y: scroll;
`;

const navigationStyles = css`
  grid-area: nav;
  background-color: var(--primary);
`;

const mainStyles = css`
  grid-area: main;
  padding: ${rem(16)} ${rem(32)};
  background-color: var(--main);
  border-left: ${rem(1)} solid var(--mainBorder);
  color: var(--textPrimary);
`;

const headerStyles = css`
  grid-area: header;
  display: flex;
  align-items: center;
  padding: 0 ${rem(24)} 0 ${rem(32)};
  border-left: ${rem(1)} solid var(--mainBorder);
  border-bottom: ${rem(1)} solid var(--mainBorder);
  background-color: var(--main);
  color: var(--textPrimary);
`;

const SidebarLayout: React.FC<SidebarLayoutProps> & SidebarLayoutComposition = ({
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

const Sidebar = ({ children, className }) => (
  <div
    className={className}
    css={sidebarStyles}
    data-testid="sidebar"
  >
    {children}
  </div>
);
const Header = ({ children }) => (<div css={headerStyles} data-testid="header">{children}</div>);
const Main = ({ children }) => (<div css={mainStyles} data-testid="main">{children}</div>);

SidebarLayout.Sidebar = Sidebar;
SidebarLayout.Header = Header;
SidebarLayout.Main = Main;

export { SidebarLayout };
