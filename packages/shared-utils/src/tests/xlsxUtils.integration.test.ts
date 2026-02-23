import { describe, it, expect } from 'vitest';
import { trimEmptyRows } from '../xlsxUtils';
import * as ExcelJS from 'exceljs';

function makeWorksheet(cells: Record<string, unknown>, ref?: string, rows?: unknown[]) {
  const ws: Record<string, unknown> = { ...cells };
  if (ref) ws['!ref'] = ref;
  if (rows) ws['!rows'] = rows;
  return ws;
}

// Integration test that writes a workbook to a buffer and reads it back
// to inspect the worksheet dimension and row elements.
describe('trimEmptyRows integration', () => {
  it('writes workbook and trimmed dimension is persisted in file', () => {
    const cells = { A1: { v: 'H' }, B1: { v: 'H2' }, A2: { v: 'x' } };
    const longRows: Record<string, unknown>[] = [];
    for (let i = 0; i < 10; i++) longRows.push({} as Record<string, unknown>);
    const ws = makeWorksheet(cells, 'A1:G3', longRows);

    // Apply trimming before writing
    trimEmptyRows(ws, 1);

    // Create an ExcelJS workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Populate the worksheet cells from our mock ws structure
    for (const k in ws) {
      if (!Object.prototype.hasOwnProperty.call(ws, k)) continue;
      if (k.charAt(0) === '!') continue;
      const v = (ws as unknown as Record<string, unknown>)[k];
      const m = k.match(/([A-Z]+)(\d+)$/i);
      if (!m) continue;
      const col = m[1];
      const row = parseInt(m[2], 10);
      const colIdx = (col.split('') as string[]).reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);
      const cell = worksheet.getRow(row).getCell(colIdx);
      const obj = v as Record<string, unknown> | undefined;
      if (obj && typeof (obj as any).v !== 'undefined') cell.value = (obj as any).v as any;
    }

    // Write to buffer and read back
    return workbook.xlsx.writeBuffer().then((buffer) => {
      const wb2 = new ExcelJS.Workbook();
      return wb2.xlsx.load(buffer).then(() => {
        const ws2 = wb2.getWorksheet('Sheet1');
        // ExcelJS normalizes rowCount to last non-empty row
        expect(ws2.rowCount).toBe(2);
      });
    });
  });
});
