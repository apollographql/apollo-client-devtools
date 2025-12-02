import clsx from "clsx";
import type { ReactNode } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

interface SidebarLayoutProps {
  children: ReactNode;
}

interface SidebarProps {
  className?: string;
  children?: ReactNode;
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

const Sidebar = ({ className, children }: SidebarProps) => {
  return (
    <>
      <Panel
        id="sidebar"
        defaultSize={25}
        minSize={10}
        className={clsx(className, "h-full p-4")}
        tagName="aside"
      >
        {children}
      </Panel>
      <PanelResizeHandle
        className="border-r border-primary dark:border-primary-dark"
        // Fix issue in tests between jsdom and the changes made in
        // react-resizable-panels@2.0.17 which prevent the click from
        // registering.
        disabled={process.env.NODE_ENV === "test"}
      />
    </>
  );
};

interface MainProps {
  className?: string;
  children?: ReactNode;
}

const Main = ({ className, children }: MainProps) => (
  <Panel
    id="content"
    defaultSize={70}
    minSize={30}
    data-testid="main"
    className={clsx(className, "bg-primary dark:bg-primary-dark p-4")}
  >
    {children}
  </Panel>
);

SidebarLayout.Sidebar = Sidebar;
SidebarLayout.Main = Main;

export { SidebarLayout };
