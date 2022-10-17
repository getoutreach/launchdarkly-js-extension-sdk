import { extensionPlatform } from './extensionPlatform';
import * as LocalStorage from './localStorage';
import { isSynchronousFlush, setSynchronousFlush } from './synchronousFlush';

describe('extensionPlatform', () => {
  const localStorage = {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  };

  beforeAll(() => {
    Object.defineProperty(globalThis, '__VERSION__', { value: '1.8.6' });
  });

  beforeEach(() => {
    jest.spyOn(LocalStorage, 'createLocalStorage').mockReturnValue(localStorage);
  });

  it('returns extension specific platform implementation', () => {
    const platform = extensionPlatform();

    expect(platform.synchronousFlush).toEqual(false);
    expect(platform.httpRequest).toBeDefined();
    expect(platform.httpAllowsPost()).toEqual(true);
    expect(platform.httpFallbackPing).toBeDefined();
    expect(platform.getCurrentUrl()).toEqual('');
    expect(platform.isDoNotTrack()).toEqual(false);
    expect(platform.localStorage).toEqual(localStorage);
    expect(platform.eventSourceAllowsReport).toEqual(false);
    expect(platform.eventSourceConstructor).toBeDefined();
    expect(platform.eventSourceFactory).toBeDefined();
    expect(platform.eventSourceIsActive).toBeDefined();
    expect(platform.userAgent).toEqual('JSExtension');
    expect(platform.version).toEqual('1.8.6');
    expect(platform.diagnosticSdkData).toEqual({
      name: 'js-extension-sdk',
      version: '1.8.6',
    });
    expect(platform.diagnosticPlatformData).toEqual({
      name: 'JSEXTENSION',
    });
    expect(platform.diagnosticUseCombinedEvent).toEqual(true);
  });

  describe('httpRequest', () => {
    let fetchSpy: jest.SpiedFunction<typeof fetch>;

    beforeEach(() => {
      fetchSpy = jest.spyOn(globalThis, 'fetch');
    });

    it('performs fetch', async () => {
      fetchSpy.mockResolvedValue(
        new Response('responseBody', { headers: new Headers({ responseHeader: 'responseHeaderValue' }) })
      );
      const platform = extensionPlatform();

      const { promise } = platform.httpRequest(
        'POST',
        'https://localhost',
        { requestHeader: 'requestHeaderValue' },
        'baz'
      );
      const { status, header, body } = await promise;

      expect(fetchSpy).toBeCalledWith('https://localhost', {
        method: 'POST',
        headers: new Headers({ requestHeader: 'requestHeaderValue' }),
        body: 'baz',
        signal: expect.any(AbortSignal),
        keepalive: false,
      });

      expect(status).toEqual(200);
      expect(header('responseHeader')).toEqual('responseHeaderValue');
      expect(body).toEqual('responseBody');
    });

    it('performs fetch with keep alive option when sync flush flag is set', async () => {
      fetchSpy.mockResolvedValue(new Response('responseBody'));
      const platform = extensionPlatform();

      setSynchronousFlush(true);
      const { promise } = platform.httpRequest('POST', 'https://localhost/foo', {}, 'baz');
      await promise;

      expect(fetchSpy).toBeCalledWith('https://localhost/foo', {
        method: 'POST',
        headers: new Headers({}),
        body: 'baz',
        signal: expect.any(AbortSignal),
        keepalive: true,
      });
      expect(isSynchronousFlush()).toEqual(false);
    });

    it('throws error when fetch fails', async () => {
      fetchSpy.mockRejectedValue(new Error('unknown error'));
      const platform = extensionPlatform();
      const { promise } = platform.httpRequest('POST', 'https://localhost/foo', {}, 'baz');

      await expect(promise).rejects.toEqual(new Error('unknown error'));
    });

    it('returns undefined when aborted', async () => {
      const error = new Error('abort error');
      error.name = 'AbortError';
      fetchSpy.mockRejectedValue(error);
      const platform = extensionPlatform();
      const { promise } = platform.httpRequest('POST', 'https://localhost/foo', {}, 'baz');

      expect(await promise).toBeUndefined();
    });

    it('aborts on cancel', async () => {
      fetchSpy.mockResolvedValue(new Response('response '));
      const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
      const platform = extensionPlatform();
      const { cancel } = platform.httpRequest('POST', 'https://localhost/foo', {}, 'baz');

      expect(abortSpy).not.toBeCalled();
      cancel();
      expect(abortSpy).toBeCalledTimes(1);

      await Promise;
    });
  });

  describe('eventSourceFactory', () => {
    it('creates event source', () => {
      const platform = extensionPlatform();
      const eventSource = platform.eventSourceFactory('http://localhost', { withCredentials: true });

      expect(eventSource.url).toEqual('http://localhost');
      expect(eventSource.eventSourceInitDict).toEqual({ withCredentials: true, skipDefaultHeaders: true });
    });
  });

  describe('eventSourceIsActive', () => {
    it.each`
      readyState                | expected
      ${EventSource.OPEN}       | ${true}
      ${EventSource.CONNECTING} | ${true}
      ${EventSource.CLOSED}     | ${false}
    `('returns $expected when readyState is $readyState', ({ readyState, expected }) => {
      const eventSource = new EventSource('https://localhost');
      jest.spyOn(eventSource, 'readyState', 'get').mockReturnValue(readyState);
      // eventSource.readyState = readyState;
      const platform = extensionPlatform();
      expect(platform.eventSourceIsActive(eventSource)).toEqual(expected);
    });
  });
});
