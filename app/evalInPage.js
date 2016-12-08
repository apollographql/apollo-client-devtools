export default function evalInPage(code, cb) {
  if (chrome && chrome.devtools) {
    return chrome.devtools.inspectedWindow.eval(code);
  } else {
    let result;
    try {
      result = eval(code);
    } catch (e) {
      cb(e, true);
    }

    cb(result);
  }
}
