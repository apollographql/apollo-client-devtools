import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import type { AlertProps } from "../Alert";

interface AlertDisclosureContextValue {
  variant: AlertProps["variant"];
}

const AlertDisclosureContext = createContext<AlertDisclosureContextValue>({
  variant: "error",
});

interface AlertDisclosureProviderProps extends AlertDisclosureContextValue {
  children?: ReactNode;
}

export function AlertDisclosureProvider({
  children,
  variant,
}: AlertDisclosureProviderProps) {
  const value = useMemo(() => ({ variant }), [variant]);

  return (
    <AlertDisclosureContext.Provider value={value}>
      {children}
    </AlertDisclosureContext.Provider>
  );
}

export function useAlertDisclosure() {
  return useContext(AlertDisclosureContext);
}
