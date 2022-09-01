import { isSynchronousFlush, setSynchronousFlush } from './synchronousFlush';

declare let __VERSION__: string;

export function extensionPlatform(): unknown {
  const executeFetch = async (
    method: string,
    url: string,
    headers: Record<string, string>,
    body: string,
    signal: AbortSignal
  ) => {
    try {
      const fetchHeaders = new Headers(headers);

      if (isSynchronousFlush()) {
        fetchHeaders.set('keepalive', 'true');
        setSynchronousFlush(false);
      }

      const result = await fetch(url, {
        method,
        headers: fetchHeaders,
        body,
        signal,
      });

      return {
        status: result.status,
        header: (key: string) => result.headers.get(key),
        body: await result.text(),
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      throw error;
    }
  };

  const httpRequest = (method: string, url: string, headers: Record<string, string>, body: string) => {
    const abortController = new AbortController();

    const fetchPromise = executeFetch(method, url, headers, body, abortController.signal);

    return { promise: fetchPromise, cancel: () => abortController.abort() };
  };

  const httpAllowsPost = () => true;

  // No need, POST will always available
  const httpFallbackPing = () => {};

  // No url in the service worker
  const getCurrentUrl = () => '';

  // doNotTrack navigator property was dropped from the standards
  const isDoNotTrack = () => false;

  // Extension specific implementation of local storage backed by chrome.storage.local
  const localStorage = {
    get: async (key: string): Promise<string | undefined> => {
      const values = await chrome.storage.local.get(key);
      const returnValue = values[key];

      return typeof returnValue === 'string' ? returnValue : undefined;
    },
    set: (key: string, value: string): Promise<void> => chrome.storage.local.set({ [key]: value }),
    clear: (key: string): Promise<void> => chrome.storage.local.remove(key),
  };

  // We won't support useReport option foe now
  const eventSourceAllowsReport = false;
  const eventSourceConstructor = globalThis.EventSource;
  const eventSourceFactory = (url: string, eventOptions: EventSourceInit) => {
    const defaultOptions = {
      skipDefaultHeaders: true,
    };

    const esOptions = { ...defaultOptions, ...eventOptions };

    return new eventSourceConstructor(url, esOptions);
  };

  // If EventSource does not exist, the absence of eventSourceFactory will make us not try to open streams
  const eventSourceIsActive = (es: EventSource) =>
    es.readyState === window.EventSource.OPEN || es.readyState === window.EventSource.CONNECTING;

  const userAgent = 'JSExtension';
  const version = __VERSION__;

  const diagnosticSdkData = {
    name: 'js-extension-sdk',
    version: __VERSION__,
  };

  const diagnosticPlatformData = {
    name: 'JSEXTENSION',
  };

  const diagnosticUseCombinedEvent = true; // the browser SDK uses the "diagnostic-combined" event format

  return {
    synchronousFlush: false,
    httpRequest,
    httpAllowsPost,
    httpFallbackPing,
    getCurrentUrl,
    isDoNotTrack,
    localStorage,
    eventSourceAllowsReport,
    eventSourceConstructor,
    eventSourceFactory,
    eventSourceIsActive,
    userAgent,
    version,
    diagnosticSdkData,
    diagnosticPlatformData,
    diagnosticUseCombinedEvent,
  };
}
