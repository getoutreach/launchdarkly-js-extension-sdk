interface LocalStorage {
  get: (key: string) => Promise<string | undefined>;
  set: (key: string, value: string) => Promise<void>;
  clear: (key: string) => Promise<void>;
}

const localStorageBase: Pick<LocalStorage, 'set'> = {
  /**
   * MV3 is unreliable in returning a promise from the set method. Resolved with a MV2 callback api instead.
   */
  set: (key: string, value: string): Promise<void> =>
    new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        checkLastError(reject);

        resolve();
      });
    }),
};

const localStorageV3: LocalStorage = {
  ...localStorageBase,
  get: async (key: string): Promise<string | undefined> => {
    const values = await chrome.storage.local.get(key);
    const returnValue = values[key];

    return typeof returnValue === 'string' ? returnValue : undefined;
  },
  clear: (key: string): Promise<void> => chrome.storage.local.remove(key),
};

/**
 * Makes the sdk compatible with manifest v2, remove this once manifest v2 sunsets
 */
const localStorageV2: LocalStorage = {
  ...localStorageBase,
  get: key =>
    new Promise((resolve, reject) =>
      chrome.storage.local.get(key, values => {
        checkLastError(reject);

        const returnValue = values[key];

        resolve(typeof returnValue === 'string' ? returnValue : undefined);
      })
    ),
  clear: key =>
    new Promise((resolve, reject) =>
      chrome.storage.local.remove(key, () => {
        checkLastError(reject);

        resolve();
      })
    ),
};

function checkLastError(reject: (reason: unknown) => void) {
  if (chrome.runtime.lastError) {
    reject(chrome.runtime.lastError.message);
  }
}

export function createLocalStorage() {
  return chrome.runtime.getManifest()?.manifest_version === 3 ? localStorageV3 : localStorageV2;
}
