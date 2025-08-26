import { createContext, useContext } from "react";

import type * as v4 from "@apollo/client/react";

export interface ClientContext {
  useQuery: typeof v4.useQuery;
  useLazyQuery: typeof v4.useLazyQuery;
  useMutation: typeof v4.useMutation;
}

const Context = createContext<ClientContext | undefined>(undefined);

export type ClientProvider = React.FC<React.PropsWithChildren>;

export const ClientContextProvider = Context.Provider;

export const useQuery = ((query, options: any) =>
  useContext(Context)!.useQuery(query, options)) as typeof v4.useQuery;

export const useLazyQuery = ((query, options: any) =>
  useContext(Context)!.useLazyQuery(query, options)) as typeof v4.useLazyQuery;

export const useMutation = ((query, options: any) =>
  useContext(Context)!.useMutation(query, options)) as typeof v4.useMutation;
