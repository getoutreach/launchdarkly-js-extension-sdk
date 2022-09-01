# @outreach/launchdarkly-js-extension-sdk

LaunchDarkly SDK for browser extension background service workers.

The SDK is built on top of [js-sdk-common](https://github.com/launchdarkly/js-sdk-common) which is not an
official API provided by LaunchDarkly. This SDK can break with feature releases of [js-sdk-common](https://github.com/launchdarkly/js-sdk-common).

The implementation of the SDK is similar to [browser SDK](https://github.com/launchdarkly/js-client-sdk) with following differences:

- It uses `fetch` instead of `XMLHttpRequest` for network requests
- It uses `chrome.storage.local` for flag caching instead of `localStorage`
- It hooks to `chrome.runtime.onSuspend` for cleanup (flushing analytic events) instead of `unload` event listener
