import base from '@repo/vitest-config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
