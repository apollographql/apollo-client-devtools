export default function evalInPage(code, cb) {
  if (chrome && chrome.devtools) {
    chrome.devtools.inspectedWindow.eval(code, cb);
    return;
  }
  let result;
  try {
    result = eval(code);
  } catch (e) {
    cb(undefined, { isException: true, value: e.toString() });
    return;
  }
  cb(result);
}
