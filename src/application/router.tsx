import {
  createRoutesFromElements,
  createMemoryRouter,
  Route,
} from "react-router-dom";

import { App } from "./App";
import * as ConnectorsPage from "./pages/connectors";
import * as ConnectorsIndexPage from "./pages/connectors/index";
import * as ConnectorPage from "./pages/connectors/$operationId";
import * as ConnectorIndexPage from "./pages/connectors/$operationId/index";

export const router = createMemoryRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="connectors" element={<ConnectorsPage.Route />}>
        <Route index element={<ConnectorsIndexPage.Route />} />
        <Route
          path=":operationId"
          element={<ConnectorPage.Route />}
          loader={ConnectorPage.loader}
        >
          <Route index element={<ConnectorIndexPage.Route />} />
        </Route>
      </Route>
    </Route>
  )
);
