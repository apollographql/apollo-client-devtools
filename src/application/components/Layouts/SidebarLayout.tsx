/** @jsxImportSource @emotion/react */
import { ReactNode, useState, useRef } from "react";
import { css } from "@emotion/react";
import { rem } from "polished";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

import { Modal } from "./SettingsModal";
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
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 0.75rem;
  border-bottom: ${rem(1)} solid var(--mainBorder);
  background-color: var(--main);
  color: var(--textPrimary);
  height: 2.75rem;
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
        style={{
          overflow: "scroll",
          height: "100vh",
          backgroundColor: "var(--primary)",
        }}
      >
        <div data-testid="sidebar">
          <Navigation
            queriesCount={navigationProps.queriesCount}
            mutationsCount={navigationProps.mutationsCount}
          />
          <div css={listStyles}>{children}</div>
        </div>
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
      overflow: "scroll",
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

const Header = ({ children }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);

  return (
    <div css={headerStyles} data-testid="header">
      {children}
      {/* In order to avoid duplicating the cog component everywhere
        `SidebarLayout.Header` is used, we use margin-left: auto as the default,
        and margin-left: 4 when displayed next to the explorer button.
      */}
      <button
        className="ml-auto peer-[.is-explorer-button]:ml-6"
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">Settings</span>
        <Cog6ToothIcon aria-hidden="true" className="h-6 w-6" />
      </button>
      <Modal open={open} setOpen={setOpen} cancelButtonRef={cancelButtonRef} />
    </div>
  );
};

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
