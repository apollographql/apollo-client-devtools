import { ReactNode } from "react";
import { css } from "@emotion/react";
import { rem } from "polished";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { Navigation, NavigationProps } from "./Navigation";

interface SidebarLayoutProps {
  navigationProps: NavigationProps;
  children: ReactNode;
}

interface SidebarProps {
  navigationProps: NavigationProps;
  children: ReactNode;
}

const listStyles = css`
  grid-area: list;
  padding: 0 1rem;
`;

const headerStyles = css`
  grid-area: header;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  border-bottom: ${rem(1)} solid var(--mainBorder);
  background-color: var(--main);
  color: var(--textPrimary);
  height: 2.5rem;
`;

const mainStyles = css`
  grid-area: main;
  padding: 0 1rem 2rem;
  background-color: var(--main);
  color: var(--textPrimary);
`;

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  return (
    <PanelGroup
      direction="horizontal"
      data-testid="layout"
      autoSaveId="layout"
      style={{ display: "flex" }}
    >
      {children}
    </PanelGroup>
  );
};

const Sidebar = ({ navigationProps, children }: SidebarProps) => {
  return (
    <>
      <Panel
        id="sidebar"
        defaultSize={25}
        minSize={10}
        data-testid="sidebar"
        style={{
          height: "100vh",
          backgroundColor: "var(--primary)",
        }}
      >
        <Navigation
          queriesCount={navigationProps.queriesCount}
          mutationsCount={navigationProps.mutationsCount}
        />
        <div css={listStyles}>{children}</div>
      </Panel>
      <PanelResizeHandle
        style={{
          border: "1px solid var(--mainBorder)",
        }}
      />
    </>
  );
};

interface ContentProps {
  children?: ReactNode;
}

const Content = ({ children }: ContentProps) => (
  <Panel
    id="content"
    defaultSize={70}
    minSize={30}
    data-testid="content"
    style={{
      height: "100vh",
      width: "100%",
      backgroundColor: "var(--main)",
    }}
  >
    {children}
  </Panel>
);

interface HeaderProps {
  children?: ReactNode;
}

const Header = ({ children }: HeaderProps) => (
  <div css={headerStyles} data-testid="header">
    {children}
  </div>
);

interface MainProps {
  children?: ReactNode;
}

const Main = ({ children }: MainProps) => (
  <div css={mainStyles} data-testid="main">
    {children}
  </div>
);

SidebarLayout.Sidebar = Sidebar;
SidebarLayout.Content = Content;
SidebarLayout.Header = Header;
SidebarLayout.Main = Main;

export { SidebarLayout };
