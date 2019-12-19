function getFiberRoots() {
  let fiberRoots: any[] = [];
  const reactDevtoolsHook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (reactDevtoolsHook?.renderers) {
    const keys = reactDevtoolsHook.renderers.keys();
    for (const renderer of keys) {
      fiberRoots = Array.from(reactDevtoolsHook.getFiberRoots(renderer));
    }
  }
  return fiberRoots;
}

const fiberRoots = getFiberRoots();
console.log("fiber roots", fiberRoots);
