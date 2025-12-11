import type { Tester } from "@jest/expect-utils";
import { Added, Changed, Deleted } from "../../src/application/utilities/diff";

export const areAddedInstancesEqual: Tester = function (a, b, customTesters) {
  const isAAdded = a instanceof Added;
  const isBAdded = b instanceof Added;

  if (isAAdded && isBAdded) {
    return this.equals(a.value, b.value, customTesters);
  } else if (isAAdded === isBAdded) {
    return undefined;
  } else {
    return false;
  }
};

export const areChangedInstancesEqual: Tester = function (a, b, customTesters) {
  const isAChanged = a instanceof Changed;
  const isBChanged = b instanceof Changed;

  if (isAChanged && isBChanged) {
    return (
      this.equals(a.oldValue, b.oldValue, customTesters) &&
      this.equals(a.newValue, b.newValue, customTesters)
    );
  } else if (isAChanged === isBChanged) {
    return undefined;
  } else {
    return false;
  }
};

export const areDeletedInstancesEqual: Tester = function (a, b, customTesters) {
  const isADeleted = a instanceof Deleted;
  const isBDeleted = b instanceof Deleted;

  if (isADeleted && isBDeleted) {
    return this.equals(a.value, b.value, customTesters);
  } else if (isADeleted === isBDeleted) {
    return undefined;
  } else {
    return false;
  }
};
