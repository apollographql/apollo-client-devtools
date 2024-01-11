import { ReactNode } from "react";
import { clsx } from "clsx";

interface FullWidthLayoutProps {
  children: ReactNode;
  className?: string;
}

const FullWidthLayout = ({ children, className }: FullWidthLayoutProps) => {
  return (
    <div
      data-testid="layout"
      className={clsx(className, "flex-1 flex flex-col")}
    >
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
  <div className={clsx(className, "flex-1")} data-testid="main">
    {children}
  </div>
);

FullWidthLayout.Header = Header;
FullWidthLayout.Main = Main;

export { FullWidthLayout };
