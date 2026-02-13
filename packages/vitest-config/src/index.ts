import { defineConfig } from 'vitest/config';

// `coverage` is a Vitest-specific config, not part of the Vite `UserConfig` type,
// so we cast the object to include an optional `coverage` property while
// preserving the Vite UserConfig types for all other fields.
export default defineConfig(
  (
    {
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
    } as unknown as import('vite').UserConfig & { coverage?: any }
  )
);
