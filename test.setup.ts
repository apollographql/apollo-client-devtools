import { expect } from "@jest/globals";
import "@testing-library/jest-dom";

import matchMedia from "./src/application/utilities/testing/matchMedia";
import {
  areAddedInstancesEqual,
  areChangedInstancesEqual,
  areDeletedInstancesEqual,
} from "./jest/equalityTesters/diff";

matchMedia();

expect.addEqualityTesters([
  areAddedInstancesEqual,
  areChangedInstancesEqual,
  areDeletedInstancesEqual,
]);
