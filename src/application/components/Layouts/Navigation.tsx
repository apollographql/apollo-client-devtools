import React, { ReactNode, useContext } from "react";
import { makeVar, useReactiveVar } from "@apollo/client";
import { css } from "@emotion/react";
import { rem } from "polished";
import { colors } from "@apollo/space-kit/colors";
import { ApolloLogo } from "@apollo/space-kit/icons/ApolloLogo";

import { DevtoolsContext } from "../../App";

export enum Screens {
  Cache = "cache",
  Queries = "queries",
  Mutations = "mutations",
  Explorer = "explorer",
}

type NavButtonProps = {
  children: ReactNode;
  isSelected: boolean;
  onClick: any;
};

export type NavigationProps = {
  queriesCount: number;
  mutationsCount: number;
};
//overflow-x: overlay;
//height: 2.5rem;
const navigationStyles = css`
  grid-area: nav;
  display: flex;
  align-items: center;
  box-shadow: 0 ${rem(-1)} 0 0 rgba(255, 255, 255, 0.3) inset;
  background-color: var(--primary);

  scrollbar-gutter: stable both-edges;

  &::-webkit-scrollbar {
    display: block;
    overflow: auto;
    height: 2em;
    width: 5px;
    height: 8px;
    background-color: #aaa; /* or add it to the track */
  }
  &::-webkit-scrollbar-thumb {
    background: #000;
  }
`;

const selectedNavButtonStyles = css`
  color: ${colors.silver.lighter};
  box-shadow: 0 ${rem(-2)} 0 0 ${colors.silver.lighter} inset;
`;

const navButtonStyles = css`
  appearance: none;
  margin: 0 ${rem(10)};
  padding: ${rem(12)} 0;
  font-size: ${rem(13)};
  border: none;
  background-color: transparent;
  color: var(--whiteTransparent);
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: ${colors.silver.lighter};
  }

  &:focus {
    outline: none;
  }
`;

const listStyles = css`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: start;
  margin: 0 ${rem(5)};
  padding: 0;
  list-style: none;
`;
const listStyles2 = css`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: start;
  justify-content: start;
  margin: 0 ${rem(5)};
  padding: 10px 0 0;
  list-style: none;
`;
const logoLinkStyles = css`
  display: block;
`;

const logoStyles = css`
  width: ${rem(24)};
  height: auto !important;
  margin: 0 ${rem(16)};
  color: ${colors.silver.lighter};
`;

const borderStyles = css`
  border-right: ${rem(1)} solid var(--whiteTransparent);
`;

const NavButton = ({ isSelected, onClick, children }: NavButtonProps) => (
  <button
    css={[navButtonStyles, isSelected && selectedNavButtonStyles]}
    onClick={onClick}
  >
    {children}
  </button>
);

export const currentScreen = makeVar<Screens>(Screens.Queries);

export const Navigation: React.FC<NavigationProps> = ({
  queriesCount,
  mutationsCount,
}) => {
  const selected = useReactiveVar<Screens>(currentScreen);
  const isSelected = (NavButton: Screens) => selected === NavButton;
  const onNavigate = (screen: Screens) => currentScreen(screen);
  //const [navCol, setNavCol] = useState(true)
  const { sidebarWidth } = useContext(DevtoolsContext);
  console.log("meow:", sidebarWidth);

  return (
    <nav css={navigationStyles}>
      <ul
        css={
          selected != Screens.Explorer && sidebarWidth < 375
            ? listStyles2
            : listStyles
        }
      >
        <li>
          <a
            href="https://go.apollo.dev/c/docs"
            target="_blank"
            title="Apollo Client developer documentation"
            css={logoLinkStyles}
            rel="noreferrer"
          >
            <ApolloLogo css={logoStyles} />
          </a>
        </li>
        <li>
          <NavButton
            isSelected={isSelected(Screens.Explorer)}
            onClick={() => {
              onNavigate(Screens.Explorer);
            }}
          >
            Explorer
          </NavButton>
        </li>
        <li>
          <NavButton
            isSelected={isSelected(Screens.Queries)}
            onClick={() => onNavigate(Screens.Queries)}
          >
            Queries ({queriesCount})
          </NavButton>
        </li>
        <li>
          <NavButton
            isSelected={isSelected(Screens.Mutations)}
            onClick={() => onNavigate(Screens.Mutations)}
          >
            Mutations ({mutationsCount})
          </NavButton>
        </li>
        <li>
          <NavButton
            isSelected={isSelected(Screens.Cache)}
            onClick={() => onNavigate(Screens.Cache)}
          >
            Cache
          </NavButton>
        </li>
      </ul>
    </nav>
  );
};
