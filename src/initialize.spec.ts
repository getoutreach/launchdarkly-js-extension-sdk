const initializeMock = jest.fn();
jest.mock('launchdarkly-js-sdk-common', () => ({ initialize: initializeMock }));

import * as ExtensionPlatform from './extensionPlatform';
import * as CommonSdk from 'launchdarkly-js-sdk-common';
import { initialize } from './initialize';
import { LdOptions, LdUser } from './types';

describe('initialize', () => {
  it('initializes common ld sdk with extension platform', async () => {
    const startMock = jest.fn();
    const client: CommonSdk.LDClientBase = {
      waitForInitialization: jest.fn(),
      identify: jest.fn(),
      on: jest.fn(),
      variation: jest.fn(),
      waitUntilReady: jest.fn(),
      getUser: jest.fn(),
      flush: jest.fn(),
      variationDetail: jest.fn(),
      setStreaming: jest.fn(),
      off: jest.fn(),
      track: jest.fn(),
      alias: jest.fn(),
      allFlags: jest.fn(),
      close: jest.fn(),
    };
    initializeMock.mockReturnValue({
      client,
      start: startMock,
    });
    const platform = { platformId: 'extension' };
    jest.spyOn(ExtensionPlatform, 'extensionPlatform').mockReturnValue(platform);
    const user: LdUser = {
      anonymous: true,
    };
    const options: LdOptions = {
      streaming: false,
    };

    expect(await initialize('extension', user, options)).toEqual(client);
    expect(initializeMock).toBeCalledTimes(1);
    expect(initializeMock).toBeCalledWith('extension', user, options, platform, {
      disableSyncEventPost: { default: false },
    });
    expect(startMock).toBeCalledTimes(1);
  });
});
