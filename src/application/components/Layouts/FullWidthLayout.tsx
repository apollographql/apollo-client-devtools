import { ReactNode, useState } from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

import { SettingsModal } from "./SettingsModal";
import { Navigation, NavigationProps } from "./Navigation";

interface FullWidthLayoutProps {
  navigationProps: NavigationProps;
  children: ReactNode;
  className?: string;
}

const FullWidthLayout = ({
  navigationProps,
  children,
  className,
}: FullWidthLayoutProps) => {
  const { queriesCount, mutationsCount } = navigationProps;

  return (
    <div
      data-testid="layout"
      className={clsx(
        className,
        "grid [grid-template-columns:28rem_minmax(28rem,auto)] [grid-template-areas:'nav_header'_'main_main']"
      )}
    >
      <Navigation queriesCount={queriesCount} mutationsCount={mutationsCount} />
      {children}
    </div>
  );
};

interface HeaderProps {
  className?: string;
  children?: ReactNode;
}

const Header = ({ children, className }: HeaderProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={clsx(className, "[grid-area:header]")} data-testid="header">
      {children}
      <button className="ml-auto" onClick={() => setOpen(true)}>
        <span className="sr-only">Settings</span>
        <Cog6ToothIcon aria-hidden="true" className="h-6 w-6 stroke-white" />
      </button>
      <SettingsModal open={open} onOpen={setOpen} />
    </div>
  );
};

interface MainProps {
  className?: string;
  children?: ReactNode;
}

const Main = ({ children, className }: MainProps) => (
  <div
    className={clsx(className, "[grid-area:main] h-[calc(100vh-2.5rem)]")}
    data-testid="main"
  >
    {children}
  </div>
);

FullWidthLayout.Header = Header;
FullWidthLayout.Main = Main;

export { FullWidthLayout };
