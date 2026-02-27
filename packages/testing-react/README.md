# @repo/testing-react

Shared React testing helpers for the monorepo.

Exports:
- renderWithProviders
- createTestQueryClient
- server (MSW server)

Usage:
- Add `@repo/testing-react` as a devDependency (workspace:*)
- In your package's `vitest.config.ts`, add `setupFiles: ['../../packages/testing-react/dist/vitest.setup.js']` or import the `vitest.setup.ts` directly during development.
- In tests, `import { renderWithProviders, userEvent, server } from '@repo/testing-react';`

Examples

Extend shared vitest config in a package:

```ts
import base, { reactTestOptions } from '@repo/vitest-config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    ...reactTestOptions,
  },
});
```

Use `renderWithProviders` in a test:

```ts
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@repo/testing-react';

describe('MyComponent', () => {
  it('renders', async () => {
    const { getByText, user } = renderWithProviders(<div>Hello</div>);
    expect(getByText('Hello')).toBeTruthy();
    // user is typed as UserEventLike: click/type/tab/clear
    await user.click(getByText('Hello'));
  });
});
```

Notes
- `renderWithProviders` returns the `user` helper typed as a small `UserEventLike` interface to avoid leaking internal `@testing-library/user-event` types in the package d.ts. If you need fuller typing, import `@testing-library/user-event` directly in your test file.
- The package provides `dist/vitest.setup.js` which the shared vitest config references for React tests.
