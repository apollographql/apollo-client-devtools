import type { ReactNode } from "react";
import { clsx } from "clsx";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { Header } from "./Header";
import { QueryString } from "./QueryString";
import { Tabs } from "./Tabs";
import { TabContent } from "./TabContent";
import { Title } from "./Title";

interface QueryLayoutProps {
  children: ReactNode;
}

export function QueryLayout({ children }: QueryLayoutProps) {
  return (
    <SidebarLayout.Main
      className={clsx(
        "grid gap-x-6 gap-y-2 !overflow-y-auto !overflow-x-hidden [grid-template-areas:'header'_'content'_'tabs'] [grid-template-columns:minmax(0,1fr)] [grid-template-rows:auto_auto_minmax(0,1fr)]",
        "lg:[grid-template-areas:'header_tabs'_'content_tabs'] lg:[grid-template-columns:minmax(0,1fr)_310px] lg:[grid-template-rows:auto_minmax(0,1fr)]"
      )}
    >
      {children}
    </SidebarLayout.Main>
  );
}

QueryLayout.Header = Header;
QueryLayout.QueryString = QueryString;
QueryLayout.Tabs = Tabs;
QueryLayout.TabContent = TabContent;
QueryLayout.Title = Title;
