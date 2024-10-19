import {
  createRoutesFromElements,
  createMemoryRouter,
  Route,
} from "react-router-dom";

import { App } from "./App";

export const router = createMemoryRouter(
  createRoutesFromElements(<Route path="/" element={<App />} />)
);
