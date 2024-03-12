import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { ApolloProvider } from "@apollo/client";
import userEvent from "@testing-library/user-event";

import { client } from "../../index";

export const renderWithApolloClient = (
  ui: ReactElement,
  { providerProps, ...renderOptions } = { providerProps: {} }
) => {
  const utils = render(
    <ApolloProvider client={client} {...providerProps}>
      {ui}
    </ApolloProvider>,
    renderOptions
  );
  // eslint-disable-next-line testing-library/await-async-events
  return { ...utils, user: userEvent.setup() };
};
