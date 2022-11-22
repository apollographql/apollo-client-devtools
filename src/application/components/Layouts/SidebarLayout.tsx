/** @jsx jsx */

import { ReactNode, useContext } from "react";
import React from "react"
import { jsx, css } from "@emotion/react";
import { rem } from "polished";

import { Navigation, NavigationProps } from "./Navigation";

import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

import { DevtoolsContext } from '../../App'
interface SidebarLayoutProps {
  navigationProps: NavigationProps;
  children: any;
}

interface SidebarProps {
  navigationProps: NavigationProps;
  children: ReactNode;
  className?: string;
}

interface SidebarLayoutComposition {
  Sidebar: React.FC<SidebarProps>;
  Content: React.FC;
  Header: React.FC;
  Main: React.FC;
}

const layoutStyles = css`
  display: inline-grid;
  grid-template-columns: auto;
  grid-template-areas: "sidebar content";
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
  grid-area: content;
  grid-template-areas:
    "header"
    "main";
  height: 100vh;
  overflow: auto;
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

const SidebarLayout: React.FC<SidebarLayoutProps> &
  SidebarLayoutComposition = ({ children }) => {
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
  top: 50%;
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

const MyHandle = React.forwardRef((props:any, ref:any) => {
  const {handleAxis, ...restProps} = props;
  console.log("Mewling!")
  return (
  <div ref={ref} className={'Resizer'} css={resizerStyles} {...restProps}  >
    <div className={'Handle'} css={handleStyles}/>
  </div>

  );
});

const Sidebar = ({ navigationProps, children, className }) => {
  const {sidebarWidth, setSidebarWidth} = useContext(DevtoolsContext)
  return (
  <ResizableBox onResize={(e, data)=>setSidebarWidth(data.size.width)} width={sidebarWidth} height={100} axis={'x'} resizeHandles={['e']} handle={<MyHandle />}>
  <div className={className} css={sidebarStyles} data-testid="sidebar">
    <Navigation
      queriesCount={navigationProps.queriesCount}
      mutationsCount={navigationProps.mutationsCount}
    />
    <div css={listStyles}>{children}</div>
  </div>
  </ResizableBox>
)};

const Content = ({ children }) => (
  <div css={contentStyles} data-testid="content">
    {children}
  </div>
);

const Header = ({ children }) => (
  <div css={headerStyles} data-testid="header">
    {children}
  </div>
);

const Main = ({ children }) => (
  <div css={mainStyles} data-testid="main">
    {children}
  </div>
);

SidebarLayout.Sidebar = Sidebar;
SidebarLayout.Content = Content;
SidebarLayout.Header = Header;
SidebarLayout.Main = Main;

export { SidebarLayout };
