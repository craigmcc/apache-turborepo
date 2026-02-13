// Export a plain config object (typed as any) to avoid pulling in Vitest/Vite
// type definitions at package build time. Consumers (their vitest.config.ts)
// will import this module at runtime, and Vitest will accept the plain object.
const baseConfig: any = {
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
};

export default baseConfig;
