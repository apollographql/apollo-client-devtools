import type { ReactNode } from "react";
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

interface MainProps {
  className?: string;
  children?: ReactNode;
}

const Main = ({ children, className }: MainProps) => (
  <main className={clsx(className, "flex-1")}>{children}</main>
);

FullWidthLayout.Main = Main;

export { FullWidthLayout };
