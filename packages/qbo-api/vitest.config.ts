import base from '@repo/vitest-config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  ...base,
  // package-specific overrides can go in test if needed in future
});
