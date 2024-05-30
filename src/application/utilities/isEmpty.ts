import type { JSONObject } from "../types/json";

export function isEmpty(value: JSONObject | null | undefined) {
  return value == null || Object.keys(value).length === 0;
}
