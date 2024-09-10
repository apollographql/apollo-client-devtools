import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { ApolloProvider } from "@apollo/client";
import userEvent from "@testing-library/user-event";
import * as Tooltip from "@radix-ui/react-tooltip";

import { client } from "../../index";
import { createActor } from "xstate";
import {
  devtoolsMachine,
  DevToolsMachineContext,
} from "../../machines/devtoolsMachine";

export const renderWithApolloClient = (
  ui: ReactElement,
  { providerProps, ...renderOptions } = { providerProps: {} }
) => {
  const devtoolsActor = createActor(devtoolsMachine).start();
  const utils = render(
    <DevToolsMachineContext.Provider value={devtoolsActor}>
      <Tooltip.Provider>
        <ApolloProvider client={client} {...providerProps}>
          {ui}
        </ApolloProvider>
      </Tooltip.Provider>
    </DevToolsMachineContext.Provider>,
    renderOptions
  );
  // eslint-disable-next-line testing-library/await-async-events
  return { ...utils, user: userEvent.setup() };
};
