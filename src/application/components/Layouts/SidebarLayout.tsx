import { ReactNode, useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

import { SettingsModal } from "./SettingsModal";
import { Navigation, NavigationProps } from "./Navigation";

interface SidebarLayoutProps {
  navigationProps: NavigationProps;
  children: ReactNode;
}

interface SidebarProps {
  navigationProps: NavigationProps;
  children: ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  return (
    <PanelGroup
      direction="horizontal"
      data-testid="layout"
      autoSaveId="layout"
      className="flex"
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
        className="overflow-scroll h-[100vh] bg-secondary dark:bg-secondary-dark"
      >
        <div data-testid="sidebar">
          <Navigation
            queriesCount={navigationProps.queriesCount}
            mutationsCount={navigationProps.mutationsCount}
          />
          <div className="py-0 px-4">{children}</div>
        </div>
      </Panel>
      <PanelResizeHandle className="border border-secondary border-solid dark:border-secondary-dark" />
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
    className="overflow-scroll h-[100vh] w-full bg-primary dark:bg-primary-dark"
  >
    {children}
  </Panel>
);

interface HeaderProps {
  children?: ReactNode;
}

const Header = ({ children }: HeaderProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="flex justify-end items-center border-b border-solid border-secondary dark:border-secondary-dark bg-primary dark:bg-primary-dark px-3 py-0"
      data-testid="header"
    >
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
      <SettingsModal open={open} onOpen={setOpen} />
    </div>
  );
};

interface MainProps {
  children?: ReactNode;
}

const Main = ({ children }: MainProps) => (
  <div className="pt-0 px-4 pb-8" data-testid="main">
    {children}
  </div>
);

SidebarLayout.Sidebar = Sidebar;
SidebarLayout.Content = Content;
SidebarLayout.Header = Header;
SidebarLayout.Main = Main;

export { SidebarLayout };
