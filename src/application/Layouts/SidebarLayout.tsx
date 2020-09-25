/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import { useTheme } from "emotion-theming";
import { rem } from "polished";
import { Navigation, NavigationProps } from "./Navigation";

interface SidebarLayoutProps {
  navigationProps: NavigationProps
  children: any;
};

interface SidebarLayoutComposition {
  Sidebar: React.FC;
  Header: React.FC;
  Main: React.FC;
}

const layout = css`
  display: grid;
  grid-template-columns: minmax(${rem(460)}, max-content) auto;
  grid-template-areas:
    "nav header header header"
    "sidebar main main main"
`;

const sidebar = css`
  grid-area: sidebar;
  height: calc(100vh - ${rem(49)});
  padding: ${rem(16)};
`;

const navigation = css`
  grid-area: nav;
`;

const main = css`
  grid-area: main;
  padding: ${rem(44)};
`;

const header = css`
  grid-area: header;
`;

const SidebarLayout: React.FC<SidebarLayoutProps> & SidebarLayoutComposition = ({
  navigationProps,
  children,
}) => {
  const { selected, queriesCount, mutationsCount, onNavigate } = navigationProps;

  return (
    <div css={layout}>
      <Navigation
        css={navigation}
        selected={selected}
        queriesCount={queriesCount}
        mutationsCount={mutationsCount}
        onNavigate={onNavigate}
      />
      {children}
    </div>
  );
};

const Sidebar = ({ children }) => {
  const theme = useTheme<any>();
  return (
    <div 
      css={[
        sidebar, 
        { backgroundColor: theme.primary },
      ]}
    >
      {children}
    </div>
  );
};
const Header = ({ children }) => (<div css={header}>{children}</div>);
const Main = ({ children }) => (<div css={main}>{children}</div>);

SidebarLayout.Sidebar = Sidebar;
SidebarLayout.Header = Header;
SidebarLayout.Main = Main;

export { SidebarLayout };
