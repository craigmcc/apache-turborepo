/* eslint-disable @typescript-eslint/no-unused-vars, import/no-unused-modules */
import { defineConfig } from 'vitest/config';
import type { UserConfig } from 'vite';

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

export const reactSetupFile = 'node_modules/@repo/testing-react/dist/vitest.setup.js';

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
