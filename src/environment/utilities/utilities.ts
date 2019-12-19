export function log(...args: any[]) {
  chrome?.extension?.getBackgroundPage()?.console.log(args);
}
