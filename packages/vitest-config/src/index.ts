/* eslint-disable @typescript-eslint/no-unused-vars, import/no-unused-modules */
import { defineConfig } from 'vitest/config';
import type { UserConfig } from 'vite';
import * as path from 'path';
import { createRequire } from 'module';
import * as fs from 'fs';

const req = createRequire(import.meta.url);
let resolvedReactSetupFile: string | undefined;
try {
  // First try resolving as a package (this may return a node_modules path)
  resolvedReactSetupFile = req.resolve('@repo/testing-react/dist/vitest.setup.js');
} catch (e) {
  // try a set of likely workspace-relative locations
  const candidates = [
    path.resolve(process.cwd(), 'node_modules/@repo/testing-react/dist/vitest.setup.js'),
    path.resolve(process.cwd(), 'packages/testing-react/dist/vitest.setup.js'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      resolvedReactSetupFile = c;
      break;
    }
  }
  if (!resolvedReactSetupFile) {
    // As a last resort, attempt to require.resolve again (catch any errors)
    try {
      resolvedReactSetupFile = req.resolve('@repo/testing-react/dist/vitest.setup.js');
    } catch (e2) {
      // Fall back to bare specifier
      resolvedReactSetupFile = '@repo/testing-react/dist/vitest.setup.js';
    }
  }
}

// Debug log to help trace resolution during test runs
try {
  // eslint-disable-next-line no-console
  console.debug('vitest-config: resolved reactSetupFile ->', resolvedReactSetupFile);
} catch (e) {
  /* ignore */
}

const baseConfig: UserConfig & { coverage?: any } = {
  test: {
    environment: 'node',
    globals: true,
    clearMocks: true,
    include: ['**/src/**/*.test.{ts,tsx}'],
    passWithNoTests: true,
  },
  coverage: {
    provider: 'v8', // fast, built-in Node coverage
    reporter: ['text', 'lcov'],
    reportsDirectory: 'coverage',
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.d.ts'],
    all: true,
    include: ['src/**/*.{ts,tsx,js,jsx}'],
    // sensible default thresholds — packages can override locally
    statements: 70,
    branches: 60,
    functions: 70,
    lines: 70,
  },
};

export const reactSetupFile = resolvedReactSetupFile;

export const reactTestOptions = {
  environment: 'jsdom',
  setupFiles: [reactSetupFile],
};

// base default export
const base = defineConfig(baseConfig);

// reactBase merges baseConfig.test with reactTestOptions
const reactBaseConfig: UserConfig = {
  ...baseConfig,
  test: {
    ...(baseConfig.test || {}),
    ...reactTestOptions,
  },
};

export const reactBase = defineConfig(reactBaseConfig);

export default base;
