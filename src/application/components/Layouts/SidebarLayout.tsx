import React, { ReactNode, useContext } from "react";
import { css } from "@emotion/react";
import { rem } from "polished";

import { Navigation, NavigationProps } from "./Navigation";

import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

import { DevtoolsContext } from "../../App";
interface SidebarLayoutProps {
  navigationProps: NavigationProps;
  children: ReactNode;
}

interface SidebarProps {
  navigationProps: NavigationProps;
  children: ReactNode;
  className?: string;
}

const layoutStyles = css`
  display: flex;
`;

const sidebarStyles = css`
  grid-area: sidebar;
  grid-template-areas:
    "nav"
    "list";
  height: 100vh;
  background-color: var(--primary);
  overflow-y: auto;
  border-right: ${rem(1)} solid var(--mainBorder);
`;

const listStyles = css`
  grid-area: list;
  padding: 0 1rem;
`;

const contentStyles = css`
  height: 100vh;
  width: 100%;
  background-color: var(--main);
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
    <div data-testid="layout" css={layoutStyles}>
      {children}
    </div>
  );
};

const resizerStyles = css`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0);
  padding: 0 6px;
  width: 4px;
  height: 100vh;
  cursor: col-resize;
  top: 0;
  right: 0;
  position: absolute;
  opacity: 0;
  transition-duration: 200ms;
  &:hover {
    opacity: 1;
  }
`;
const handleStyles = css`
  background-color: white;
  width: 4px;
  height: 112px;
  position: absolute;
  border-radius: 2px;
`;

const MyHandle = React.forwardRef((props: any, ref: any) => {
  const { handleAxis, ...restProps } = props;

  return (
    <div ref={ref} className="resizer" css={resizerStyles} {...restProps}>
      <div className="handle" css={handleStyles} />
    </div>
  );
});

const Sidebar = ({ navigationProps, children, className }: SidebarProps) => {
  const { sidebarWidth, setSidebarWidth } = useContext(DevtoolsContext);
  return (
    <ResizableBox
      onResize={(e, data) => setSidebarWidth(data.size.width)}
      width={sidebarWidth}
      height={100}
      axis={"x"}
      resizeHandles={["e"]}
      handle={<MyHandle />}
    >
      <div className={className} css={sidebarStyles} data-testid="sidebar">
        <Navigation
          queriesCount={navigationProps.queriesCount}
          mutationsCount={navigationProps.mutationsCount}
        />
        <div css={listStyles}>{children}</div>
      </div>
    </ResizableBox>
  );
};

interface ContentProps {
  children?: ReactNode;
}

const Content = ({ children }: ContentProps) => (
  <div css={contentStyles} data-testid="content">
    {children}
  </div>
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
