import 'launchdarkly-js-sdk-common';

declare module 'launchdarkly-js-sdk-common' {
  export function initialize(
    env: string,
    user: LdUser,
    options?: LDOptionsBase,
    platform: unknown,
    extraOptions: unknown
  ): { client: LDClientBase; start: () => void };
}
