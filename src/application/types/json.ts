export type JSONPrimitive = string | number | null | boolean;
export type JSONObject = { [key: string]: JSONValue };
export type JSONValue = JSONPrimitive | JSONValue[] | JSONObject;
