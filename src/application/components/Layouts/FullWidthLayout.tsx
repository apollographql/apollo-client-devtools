import { ReactNode, useState } from "react";
import { clsx } from "clsx";

import { SettingsModal } from "./SettingsModal";
import { Button } from "../Button";
import { SettingsIcon } from "../icons/Settings";

interface FullWidthLayoutProps {
  children: ReactNode;
  className?: string;
}

const FullWidthLayout = ({ children, className }: FullWidthLayoutProps) => {
  return (
    <div data-testid="layout" className={className}>
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
    <div className={className} data-testid="header">
      {children}
      <Button
        className="ml-auto"
        size="sm"
        variant="hidden"
        onClick={() => setOpen(true)}
      >
        <SettingsIcon aria-hidden="true" />
        <span className="sr-only">Settings</span>
      </Button>
      <SettingsModal open={open} onOpen={setOpen} />
    </div>
  );
};

interface MainProps {
  className?: string;
  children?: ReactNode;
}

const Main = ({ children, className }: MainProps) => (
  <div className={clsx(className, "h-[calc(100vh-2.5rem)]")} data-testid="main">
    {children}
  </div>
);

FullWidthLayout.Header = Header;
FullWidthLayout.Main = Main;

export { FullWidthLayout };
