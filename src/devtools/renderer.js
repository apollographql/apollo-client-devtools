function getFiberRoots() {
  let fiberRoots = [];
  const reactDevtoolsHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (reactDevtoolsHook.renderers) {
    const keys = reactDevtoolsHook.renderers.keys();
    for (const renderer of keys) {
      fiberRoots = Array.from(reactDevtoolsHook.getFiberRoots(renderer));
    }
  }
  return fiberRoots;
}

const fiberRoots = getFiberRoots();

console.log('fiber roots', fiberRoots);
