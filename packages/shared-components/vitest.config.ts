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
