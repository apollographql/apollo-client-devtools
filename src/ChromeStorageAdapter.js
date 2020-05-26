// Expects a chrome.storage
// [`StorageArea`](https://developer.chrome.com/apps/storage#type-StorageArea)
// input and exports a
// [Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface
class ChromeStorageAdapter {
  constructor(chromeStorage, readyCallback) {
    if (!readyCallback) {
      throw new TypeError(
        "ChromeStorageAdapter called without a `readyCallback`",
      );
    }
    this.chromeStorage = chromeStorage;

    chromeStorage.get(
      { apolloClientDevtools: {} },
      ({ apolloClientDevtools }) => {
        this.localCache = apolloClientDevtools;

        readyCallback();
      },
    );
  }

  remoteWriteInFlight = false;
  needsRemoteWrite = false;
  localCache = {};

  // This is the magic that connects chrome's `StorageArea` interface to the
  // browser's `Storage` (ie localStorage).
  //
  // It's legal (and happens often) that we write multiple times _before_ the
  // async write operation completes. Our goal is to make sure that writes are
  // committed in order. When we write tests, this is what should be tested
  // explicitly.
  updateRemoteStorage = () => {
    // If a write in progress then flag that we need a remote write and exit
    // early.
    if (this.remoteWriteInFlight) {
      this.needsRemoteWrite = true;

      return;
    }

    // Mark that a write is pending and that there is no data pending a write.
    this.remoteWriteInFlight = true;
    this.needsRemoteWrite = false;

    // Save the current cache
    this.chromeStorage.set({ apolloClientDevtools: this.localCache }, () => {
      this.remoteWriteInFlight = false;

      // If the `needsRemoteWrite` flag was set _while this async operation was
      // in flight_, then we need to initiate another save.
      if (this.needsRemoteWrite) {
        this.updateRemoteStorage();
      }
    });
  };

  getItem = keyName => {
    return this.localCache[keyName];
  };

  setItem = (keyName, value) => {
    // Set the value locally and then async write to chrome.storage
    this.localCache[keyName] = value;

    this.updateRemoteStorage();
  };

  removeItem = keyName => {
    delete this.localCache[keyName];

    this.updateRemoteStorage();
  };

  clear = () => {
    this.localCache = {};

    this.updateRemoteStorage();
  };
}

// We only export a factory function because we need to enforce the consumer
// uses the `readyCallback`. We have to asynchronously read from the chrome
// storage to prime the local cache, so this needs to use an async callback.
export function createChromeStorageAdapter(storageArea, readyCallback) {
  if (typeof readyCallback !== "function") {
    throw new Error(
      "You must pass a `readyCallback` function to `createChromeStorageAdapter`",
    );
  }
  const chromeStorageAdapter = new ChromeStorageAdapter(storageArea, () =>
    readyCallback(chromeStorageAdapter),
  );
}
