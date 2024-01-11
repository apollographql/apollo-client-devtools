import { ReactNode, useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { SettingsModal } from "./SettingsModal";
import { Button } from "../Button";
import { SettingsIcon } from "../icons/Settings";

interface SidebarLayoutProps {
  children: ReactNode;
}

interface SidebarProps {
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

const Sidebar = ({ children }: SidebarProps) => {
  return (
    <>
      <Panel
        id="sidebar"
        defaultSize={25}
        minSize={10}
        className="!overflow-scroll h-[100vh] p-4"
        data-testid="sidebar"
      >
        {children}
      </Panel>
      <PanelResizeHandle className="border-r border-secondary dark:border-secondary-dark" />
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
    className="!overflow-scroll h-[100vh] w-full bg-primary dark:bg-primary-dark"
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
      className="flex justify-end items-center border-b border-solid border-secondary dark:border-secondary-dark bg-primary dark:bg-primary-dark px-3 py-0 h-11"
      data-testid="header"
    >
      {children}
      {/* In order to avoid duplicating the cog component everywhere
        `SidebarLayout.Header` is used, we use margin-left: auto as the default,
        and margin-left: 4 when displayed next to the explorer button.
      */}
      <Button
        className="ml-auto peer-[.is-explorer-button]:ml-2"
        size="sm"
        variant="hidden"
        onClick={() => setOpen(true)}
      >
        <SettingsIcon aria-hidden="true" />
        <span className="sr-only">Settings</span>
      </Button>
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
