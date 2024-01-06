import React, { ComponentPropsWithoutRef, ReactNode } from "react";
import { makeVar, useReactiveVar } from "@apollo/client";
import { ApolloLogo } from "@apollo/space-kit/icons/ApolloLogo";
import { clsx } from "clsx";

export enum Screens {
  Cache = "cache",
  Queries = "queries",
  Mutations = "mutations",
  Explorer = "explorer",
}

type NavButtonProps = {
  children: ReactNode;
  isSelected: boolean;
  onClick: ComponentPropsWithoutRef<"button">["onClick"];
};

export type NavigationProps = {
  queriesCount: number;
  mutationsCount: number;
};

const NavButton = ({ isSelected, onClick, children }: NavButtonProps) => (
  <button
    className={clsx(
      "appearance-none mx-2 py-3 border-y-2 border-transparent text-sm uppercase cursor-pointer whitespace-nowrap",
      "hover:text-white hover:dark:text-white-dark focus:outline-none",
      {
        "text-white dark:text-white-dark border-b-focused dark:border-b-focused-dark":
          isSelected,
      }
    )}
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

  return (
    <nav className="flex items-center bg-secondary dark:bg-secondary-dark border-b border-primary dark:border-primary-dark border-solid">
      <div className="border-r border-primary dark:border-r-primary-dark border-solid">
        <a
          href="https://go.apollo.dev/c/docs"
          target="_blank"
          title="Apollo Client developer documentation"
          className="block"
          rel="noreferrer"
        >
          <ApolloLogo className="w-[24px] !h-auto mx-4 text-primary dark:text-primary-dark" />
        </a>
      </div>
      <ul className="flex flex-wrap items-center mx-1 list-none">
        <li>
          <NavButton
            isSelected={isSelected(Screens.Explorer)}
            onClick={() => onNavigate(Screens.Explorer)}
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
