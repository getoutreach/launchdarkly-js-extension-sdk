import 'whatwg-fetch';

class EventSourcePolyfill extends EventTarget {
  public constructor(readonly url: string | URL, readonly eventSourceInitDict?: EventSourceInit | undefined) {
    super();
  }

  static readonly CLOSED = 1;
  static readonly CONNECTING = 2;
  static readonly OPEN = 3;

  get readyState(): number {
    return 1;
  }
}

Object.assign(globalThis, { EventSource: EventSourcePolyfill });
