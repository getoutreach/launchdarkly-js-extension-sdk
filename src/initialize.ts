import * as common from 'launchdarkly-js-sdk-common';

import { extensionPlatform } from './extensionPlatform';
// import { setSynchronousFlush } from './synchronousFlush';
import type { LdClient, LdOptions, LdUser } from './types';

/**
 * Initializes browser extension background service worker compliant launch darkly client
 */
export function initialize(env: string, user: LdUser, options?: LdOptions): LdClient {
  const platform = extensionPlatform();

  const clientVars = common.initialize(env, user, options, platform, {
    disableSyncEventPost: { default: false },
  });

  const client: LdClient = clientVars.client;

  clientVars.start();

  // Flush events via keepalive fetch request
  // const syncFlushHandler = createSyncFlushHandler(client);

  // Per discussion in extension google groups:
  //    https://groups.google.com/a/chromium.org/g/chromium-extensions/c/8R8ObmX7Ncc/m/SlHlYuSmAwAJ?utm_medium=email&utm_source=footer
  //    https://github.com/GoogleChrome/developer.chrome.com/pull/3676
  // The onSuspend does not fire in service worker environment
  // TODO: Keep in touch with updates to figure out if there's any other background service worker lifecycle we could tap into to
  // flush the analytic events
  // chrome.runtime.onSuspend.addListener(syncFlushHandler);

  return client;
}

// function createSyncFlushHandler(client: LdClient) {
//   return async () => {
//     setSynchronousFlush(true);
//     try {
//       await client.flush();
//     } catch (e) {
//       // Silently ignore flush errors
//     }
//     setSynchronousFlush(false);
//   };
// }
