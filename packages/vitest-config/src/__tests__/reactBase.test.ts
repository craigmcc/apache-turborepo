import { describe, it, expect } from 'vitest';
import { reactBase, reactSetupFile } from '../index.js';

describe('reactBase', () => {
  it('sets jsdom environment', () => {
    // reactBase is a UserConfig; ensure test.environment is jsdom
    const testOpts = (reactBase as any).test;
    expect(testOpts).toBeDefined();
    expect(testOpts.environment).toBe('jsdom');
  });

  it('includes the shared setup file', () => {
    const testOpts = (reactBase as any).test;
    expect(testOpts.setupFiles).toBeDefined();
    expect(testOpts.setupFiles.includes(reactSetupFile)).toBe(true);
  });
});
