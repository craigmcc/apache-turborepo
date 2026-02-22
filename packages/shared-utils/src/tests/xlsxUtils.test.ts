import { describe, it, expect } from 'vitest';
import { trimEmptyRows } from '../xlsxUtils';

function makeWorksheet(cells: Record<string, unknown>, ref?: string, rows?: unknown[]) {
  const ws: Record<string, unknown> = { ...cells };
  if (ref) ws['!ref'] = ref;
  if (rows) ws['!rows'] = rows;
  return ws;
}

describe('trimEmptyRows', () => {
  it('should not trim when worksheet already has exact range', () => {
    const ws = makeWorksheet({ A1: { v: 'H' }, A2: { v: 'a' }, B2: { v: 1 } }, 'A1:B2', [{ hpt: 20 }, { hpt: 15 }]);
    trimEmptyRows(ws, 1);
    expect(ws['!ref']).toBe('A1:B2');
  });

  it('should trim trailing empty rows beyond dataRowCount', () => {
    const ws = makeWorksheet({ A1: { v: 'H' }, A2: { v: '' }, A3: { v: '' }, B5: { v: '' } }, 'A1:B10', [{}, {}, {}, {}, {}]);
    trimEmptyRows(ws, 1);
    expect(ws['!ref']).toBe('A1:B2');
    expect(ws['A3']).toBeUndefined();
  });

  it('should keep non-empty cells beyond dataRowCount', () => {
    const ws = makeWorksheet({ A1: { v: 'H' }, A2: { v: 'x' }, A6: { v: 'y' } }, 'A1:C10', [{}, {}, {}, {}, {}, {}]);
    trimEmptyRows(ws, 1);
    expect(ws['!ref']).toBe('A1:C6');
    expect(ws['A6']).toBeDefined();
  });

  it('should handle empty worksheet gracefully', () => {
    const ws = makeWorksheet({}, undefined, undefined);
    trimEmptyRows(ws, 0);
    expect(ws['!ref']).toBeUndefined();
  });
});

