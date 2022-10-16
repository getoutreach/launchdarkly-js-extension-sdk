import { chrome as chromeMock } from 'jest-chrome';
import { createLocalStorage } from './localStorage';

describe('localStorage', () => {
  beforeAll(() => {
    Object.assign(window, { chrome: chromeMock });
  });

  afterAll(() => {
    Object.assign(window, { chrome: undefined });
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete chromeMock.runtime.lastError;
  });

  describe('v2', () => {
    beforeEach(() => {
      chromeMock.runtime.getManifest.mockReturnValue({ manifest_version: 2 });
    });

    describe('get', () => {
      it('sets storage value', async () => {
        const localStorage = createLocalStorage();
        const promise = localStorage.set('foo', 'bar');
        chromeMock.storage.local.set.mock.calls[0][1]?.();
        await promise;

        expect(chromeMock.storage.local.set).toBeCalledTimes(1);
        expect(chromeMock.storage.local.set).toBeCalledWith({ foo: 'bar' }, expect.any(Function));
      });

      it('handles error', async () => {
        const localStorage = createLocalStorage();
        const promise = localStorage.set('foo', 'bar');
        chromeMock.runtime.lastError = { message: 'lastError' };
        chromeMock.storage.local.set.mock.calls[0][1]?.();

        await expect(promise).rejects.toEqual('lastError');
      });
    });

    describe('set', () => {
      it('returns storage value when stored value type is string', async () => {
        const localStorage = createLocalStorage();
        const promise = localStorage.get('foo');
        chromeMock.storage.local.get.mock.calls[0][1]?.({ foo: 'bar' });

        expect(await promise).toEqual('bar');
        expect(chromeMock.storage.local.get).toBeCalledTimes(1);
        expect(chromeMock.storage.local.get).toBeCalledWith('foo', expect.any(Function));
      });

      it('returns undefined when stored value type is not string', async () => {
        const localStorage = createLocalStorage();
        const promise = localStorage.get('foo');
        chromeMock.storage.local.get.mock.calls[0][1]?.({ foo: 125 });

        expect(await promise).toBeUndefined();
      });

      it('handles error', async () => {
        const localStorage = createLocalStorage();
        const promise = localStorage.get('foo');
        chromeMock.runtime.lastError = { message: 'lastError' };
        chromeMock.storage.local.get.mock.calls[0][1]?.({});

        await expect(promise).rejects.toEqual('lastError');
      });
    });

    describe('remove', () => {
      it('removes storage value', async () => {
        const localStorage = createLocalStorage();
        const promise = localStorage.clear('foo');
        chromeMock.storage.local.remove.mock.calls[0][1]?.();
        await promise;

        expect(chromeMock.storage.local.remove).toBeCalledTimes(1);
        expect(chromeMock.storage.local.remove).toBeCalledWith('foo', expect.any(Function));
      });

      it('handles error', async () => {
        const localStorage = createLocalStorage();
        const promise = localStorage.clear('foo');
        chromeMock.runtime.lastError = { message: 'lastError' };
        chromeMock.storage.local.remove.mock.calls[0][1]?.();

        await expect(promise).rejects.toEqual('lastError');
      });
    });
  });

  describe('v3', () => {
    beforeEach(() => {
      chromeMock.runtime.getManifest.mockReturnValue({ manifest_version: 3 });
    });

    describe('set', () => {
      it('sets storage value', async () => {
        const localStorage = createLocalStorage();
        await localStorage.set('foo', 'bar');

        expect(chromeMock.storage.local.set).toBeCalledTimes(1);
        expect(chromeMock.storage.local.set).toBeCalledWith({ foo: 'bar' });
      });
    });

    describe('get', () => {
      it('returns storage value when stored value type is string', async () => {
        chromeMock.storage.local.get.mockImplementation(() => Promise.resolve({ foo: 'bar' }));
        const localStorage = createLocalStorage();

        expect(await localStorage.get('foo')).toEqual('bar');
        expect(chromeMock.storage.local.get).toBeCalledTimes(1);
        expect(chromeMock.storage.local.get).toBeCalledWith('foo');
      });

      it('returns undefined when stored value type is not string', async () => {
        chromeMock.storage.local.get.mockImplementation(() => Promise.resolve({ foo: 125 }));
        const localStorage = createLocalStorage();

        expect(await localStorage.get('foo')).toBeUndefined();
      });
    });

    describe('clear', () => {
      it('removes storage value', async () => {
        const localStorage = createLocalStorage();
        await localStorage.clear('foo');

        expect(chromeMock.storage.local.remove).toBeCalledTimes(1);
        expect(chromeMock.storage.local.remove).toBeCalledWith('foo');
      });
    });
  });
});
