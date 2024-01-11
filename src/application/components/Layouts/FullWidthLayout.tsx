import { ReactNode } from "react";
import { clsx } from "clsx";

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
  return (
    <div className={clsx(className, "py-2 px-4")} data-testid="header">
      {children}
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
