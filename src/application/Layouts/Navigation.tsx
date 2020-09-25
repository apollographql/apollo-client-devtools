/** @jsx jsx */
import React from "react";
import { jsx, css } from "@emotion/core";
import { useTheme } from "emotion-theming";
import { rem } from "polished";
import { colors } from "@apollo/space-kit/colors";
import { ApolloLogo } from "@apollo/space-kit/icons/ApolloLogo";

export enum Screens {
  Cache = 'cache',
  Queries = 'queries',
  Mutations = 'mutations',
  Explorer = 'explorer',
};

type NavButtonProps = {
  isSelected: boolean,
  onClick: any,
};

export type NavigationProps = {
  selected: Screens,
  queriesCount: number,
  mutationsCount: number,
  onNavigate: any,
};

const navigation = css`
  display: flex;
  align-items: center;
  box-shadow: 0 ${rem(-1)} 0 0 rgba(255, 255, 255, .3) inset;
`;

const selectedNavButton = css`
  color: ${colors.silver.lighter};
  box-shadow: 0 ${rem(-2)} 0 0 ${colors.silver.lighter} inset;
`;

const navButton = css`
  appearance: none;
  margin: 0 ${rem(16)};
  padding: ${rem(16)} 0 ${rem(20)};
  font-size: ${rem(13)};
  border: none;
  background-color: transparent;
  color: rgba(255, 255, 255, .3);
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    color: ${colors.silver.lighter};
  }
`;

const NavButton: React.FC<NavButtonProps>  = ({ isSelected, onClick, children }) => {
  const theme = useTheme<any>();

  return (
    <button
      css={[
        navButton, 
        isSelected && selectedNavButton,
      ]}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

const list = css` 
  display: flex;
  align-items: center;
  margin: 0 ${rem(16)};
  padding: 0;
  list-style: none;
`;

const logo = css`
  width: ${rem(24)};
  height: auto;
  margin: 0 ${rem(16)};
  color: ${colors.silver.lighter};
`;

const border = css`
  border-right: ${rem(1)} solid rgba(255, 255, 255, .3);
`;

export const Navigation: React.FC<NavigationProps> = ({ selected, queriesCount, mutationsCount, onNavigate }) => {
  const theme = useTheme<any>();
  const isSelected = (NavButton: Screens) => selected === NavButton;

  return (
    <nav 
      css={[
        navigation, 
        { backgroundColor: theme.primary }
      ]}>
      <div css={border}>
        <ApolloLogo css={logo} />
      </div>
      <ul css={list}>
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