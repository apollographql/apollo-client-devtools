/** @jsx jsx */
import React from "react";
import { makeVar, useReactiveVar } from "@apollo/client";
import { jsx, css } from "@emotion/core";
import { rem } from "polished";
import { colors } from "@apollo/space-kit/colors";
import { ApolloLogo } from "@apollo/space-kit/icons/ApolloLogo";

export enum Screens {
  Cache = "cache",
  Queries = "queries",
  Mutations = "mutations",
  Explorer = "explorer",
}

type NavButtonProps = {
  isSelected: boolean;
  onClick: any;
};

export type NavigationProps = {
  queriesCount: number;
  mutationsCount: number;
};

const navigationStyles = css`
  display: flex;
  align-items: center;
  box-shadow: 0 ${rem(-1)} 0 0 rgba(255, 255, 255, 0.3) inset;
  background-color: var(--primary);
`;

const selectedNavButtonStyles = css`
  color: ${colors.silver.lighter};
  box-shadow: 0 ${rem(-2)} 0 0 ${colors.silver.lighter} inset;
`;

const navButtonStyles = css`
  appearance: none;
  height: ${rem(56)};
  margin: 0 ${rem(16)};
  padding: ${rem(16)} 0 ${rem(20)};
  font-size: ${rem(13)};
  border: none;
  background-color: transparent;
  color: var(--whiteTransparent);
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    color: ${colors.silver.lighter};
  }

  &:focus {
    outline: none;
  }
`;

const NavButton: React.FC<NavButtonProps> = ({
  isSelected,
  onClick,
  children,
}) => (
  <button
    css={[navButtonStyles, isSelected && selectedNavButtonStyles]}
    onClick={onClick}
  >
    {children}
  </button>
);

const listStyles = css`
  display: flex;
  align-items: center;
  margin: 0 ${rem(16)};
  padding: 0;
  list-style: none;
`;

const logoStyles = css`
  width: ${rem(24)};
  height: auto;
  margin: 0 ${rem(16)};
  color: ${colors.silver.lighter};
`;

const borderStyles = css`
  border-right: ${rem(1)} solid var(--whiteTransparent);
`;

export const currentScreen = makeVar<Screens>(Screens.Queries);

export const Navigation: React.FC<NavigationProps> = ({
  queriesCount,
  mutationsCount,
}) => {
  const selected = useReactiveVar<Screens>(currentScreen);
  const isSelected = (NavButton: Screens) => selected === NavButton;
  const onNavigate = (screen: Screens) => currentScreen(screen);

  return (
    <nav css={navigationStyles}>
      <div css={borderStyles}>
        <ApolloLogo css={logoStyles} />
      </div>
      <ul css={listStyles}>
        <li>
          <NavButton
            isSelected={isSelected(Screens.Explorer)}
            onClick={() => onNavigate(Screens.Explorer)}
          >
            GraphiQL
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
