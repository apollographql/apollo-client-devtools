import {
  createRoutesFromElements,
  createMemoryRouter,
  Route,
} from "react-router-dom";

import { App } from "./App";
import { ConnectorsPage } from "./pages/connectors";

export const router = createMemoryRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="connectors" element={<ConnectorsPage />} />
    </Route>
  )
);
