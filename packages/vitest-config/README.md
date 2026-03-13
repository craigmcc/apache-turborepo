# @repo/vitest-config

Shared Vitest configuration for the monorepo.

Usage:
- Import the shared config in a package's `vitest.config.ts` and extend it:

```ts
import base from '@repo/vitest-config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```


## React packages

This package also exports a `reactBase` and `reactTestOptions` helper for packages that need React/jsdom testing support.

- React package (recommended): use `reactBase` which is pre-configured for `jsdom` and the shared setup file.

```ts
// vitest.config.ts
import { reactBase } from '@repo/vitest-config';
import { defineConfig } from 'vitest/config';

const baseTest = ((reactBase as unknown) as Record<string, unknown>).test as
  | Record<string, unknown>
  | undefined;

export default defineConfig({
  ...reactBase,
  test: {
    ...(baseTest || {}),
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

- React package (alternative): spread `reactTestOptions` into your existing base

```ts
import base, { reactTestOptions } from '@repo/vitest-config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  ...base,
  test: {
    ...((base as unknown) as any).test,
    ...reactTestOptions,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

Notes

- `reactBase` sets the test environment to `jsdom` and configures `setupFiles` to use the shared `@repo/testing-react` setup file (which mounts msw and other helpers). You can override these locally as needed.
- The examples use minimal `as unknown` casts where necessary to avoid complex typing problems when spreading the exported config object; this is a safe local pattern and keeps your configs simple.

Try it locally

```bash
pnpm --filter <your-package> test
# or for CI-style run
pnpm --filter <your-package> test:ci
```
