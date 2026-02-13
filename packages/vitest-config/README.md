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

