export {};

declare global {
  const __IS_FIREFOX__: boolean;
  const __IS_EXTENSION__: boolean;
  const __IS_VSCODE__: boolean;
  const VERSION: string;
}
