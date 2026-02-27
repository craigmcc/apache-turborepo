# `@turbo/eslint-config`

Collection of internal eslint configurations.

## Notes on generated files and `ignores`

This repository uses ESLint Flat Config. To avoid linting generated files (build output, coverage reports, and other artifacts) the shared base configuration now includes a default `ignores` entry that skips:

- `coverage/**`
- `dist/**`

For Next.js-specific configs the shared `nextJsConfig` already ignores Next build output (`.next/**`).

Important: the legacy `.eslintignore` file is not the recommended approach when using ESLint Flat Config; instead use the `ignores` property inside your package's `eslint.config.js` (or inherit from the shared base which already provides sensible defaults).

## Recommended minimal package `eslint.config.js`

- Node / non-React package (inherit shared base):

```javascript
import { config } from '@repo/eslint-config/base';

/** @type {import('eslint').Linter.Config} */
export default config;
```

- Next.js package (inherit shared next config):

```javascript
import { nextJsConfig } from '@repo/eslint-config/nextjs';

/** @type {import('eslint').Linter.Config} */
export default nextJsConfig;
```

If you need to add additional ignores or file-specific overrides in a package, prefer exporting a flat-config array and include an `ignores` object first, for example:

```javascript
import { config } from '@repo/eslint-config/base';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { ignores: ['coverage/**', 'dist/**', '.cache/**'] },
  ...config,
];
```

This keeps package configs minimal while ensuring ESLint doesn't scan generated or transient files.
