import { defineConfig } from 'vitest/config';

export default defineConfig({
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
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.d.ts'],
    all: true,
    include: ['src/**/*.{ts,tsx,js,jsx}'],
    // sensible default thresholds — packages can override locally
    statements: 70,
    branches: 60,
    functions: 70,
    lines: 70,
  },
});
