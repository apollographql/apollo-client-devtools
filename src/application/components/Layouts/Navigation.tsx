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
      "text-secondary dark:text-secondary-dark appearance-none py-2 border-b-4 border-b-transparent text-md cursor-pointer whitespace-nowrap",
      {
        "text-primary dark:text-primary-dark border-b-neutral dark:border-b-neutral-dark":
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
    <nav className="flex items-center gap-4 bg-secondary dark:bg-secondary-dark border-b border-b-primary dark:border-b-primary-dark">
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
      <ul className="flex flex-wrap items-center gap-6 list-none">
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
