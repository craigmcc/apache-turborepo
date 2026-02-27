import { defineConfig } from 'vitest/config';

const base = defineConfig(
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
    } as unknown as import('vite').UserConfig & { coverage?: any }
  )
);

// Helper for React packages to opt-in to jsdom and the shared setup file from testing-react.
// Consumers can spread this into their local vitest config test options.
export const reactSetupFile = 'node_modules/@repo/testing-react/dist/vitest.setup.js';

export const reactTestOptions = {
  environment: 'jsdom',
  setupFiles: [reactSetupFile],
};

export default base;
