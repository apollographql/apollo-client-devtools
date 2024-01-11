import { ReactNode } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

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
      <PanelResizeHandle className="border-r border-primary dark:border-primary-dark" />
    </>
  );
};

interface MainProps {
  children?: ReactNode;
}

const Main = ({ children }: MainProps) => (
  <Panel
    id="content"
    defaultSize={70}
    minSize={30}
    data-testid="main"
    className="!overflow-scroll h-[100vh] w-full bg-primary dark:bg-primary-dark p-4"
  >
    {children}
  </Panel>
);

SidebarLayout.Sidebar = Sidebar;
SidebarLayout.Main = Main;

export { SidebarLayout };
