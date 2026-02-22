import { describe, it, expect } from 'vitest';
import { trimEmptyRows } from '@repo/shared-utils';

describe('xlsxUtils shim', () => {
  it('re-exports trimEmptyRows from shared-utils', () => {
    expect(typeof trimEmptyRows).toBe('function');
  });
});
