// Utilities for trimming XLSX worksheets. Shared version for workspace reuse.

export function colLetterToIndex(col: string): number {
  let idx = 0;
  for (let i = 0; i < col.length; i++) {
    idx = idx * 26 + (col.charCodeAt(i) - 64);
  }
  return idx;
}

export function trimEmptyRows(ws: Record<string, unknown>, dataRowCount: number) {
  const cellKeys = Object.keys(ws).filter((k) => !k.startsWith("!"));
  if (cellKeys.length === 0) return;

  const colsRaw = Array.from(new Set(cellKeys.map((k) => (k.match(/([A-Z]+)\d+$/i) || [])[1])));
  const cols = (colsRaw.filter((c): c is string => !!c) as string[]).filter(Boolean);
  if (cols.length === 0) return;
  cols.sort((a, b) => colLetterToIndex(a) - colLetterToIndex(b));
  const detectedStartCol = String(cols[0]);
  const detectedEndCol = String(cols[cols.length - 1]);

  let startCol = detectedStartCol;
  let endCol = detectedEndCol;
  const ref = ws["!ref"];
  if (ref && typeof ref === 'string') {
    const refParts = ref.split(":");
    const refStart = refParts[0];
    const refEnd = refParts.length > 1 ? refParts[1] : refParts[0];
    const startMatch = refStart ? refStart.match(/([A-Z]+)\d+$/i) : null;
    const endMatchRef = refEnd ? refEnd.match(/([A-Z]+)\d+$/i) : null;
    if (startMatch && startMatch[1]) {
      const refStartCol = startMatch[1];
      startCol = colLetterToIndex(refStartCol as string) < colLetterToIndex(detectedStartCol as string) ? refStartCol : detectedStartCol;
    }
    if (endMatchRef && endMatchRef[1]) {
      const refEndCol = endMatchRef[1];
      endCol = colLetterToIndex(refEndCol as string) > colLetterToIndex(detectedEndCol as string) ? refEndCol : detectedEndCol;
    }
  }

  let maxRowWithValue = 1;
  for (const k of cellKeys) {
    const m = k.match(/([A-Z]+)(\d+)$/i);
    if (!m) continue;
    const row = Number(m[2]);
    const cell = ws[k];
    if (cell && typeof cell === 'object') {
      const v = (cell as Record<string, unknown>)['v'];
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        if (row > maxRowWithValue) maxRowWithValue = row;
      }
    }
  }

  const refValue = ws["!ref"];
  if (!refValue || typeof refValue !== 'string') {
    const expectedEndRow = Math.max(1, 1 + Math.max(0, dataRowCount));
    const finalEndRow = Math.max(expectedEndRow, maxRowWithValue);
    for (const k of cellKeys) {
      const m = k.match(/([A-Z]+)(\d+)$/i);
      if (!m) continue;
      const row = Number(m[2]);
      if (row > finalEndRow) delete (ws as Record<string, unknown>)[k];
    }
    (ws as Record<string, unknown>)["!ref"] = `${startCol}1:${endCol}${finalEndRow}`;
    const rowsProp = (ws as Record<string, unknown>)["!rows"];
    if (Array.isArray(rowsProp)) {
      (ws as Record<string, unknown>)["!rows"] = (rowsProp as unknown[]).slice(0, finalEndRow) as unknown;
    }
    return;
  }

  const refParts2 = (refValue as string).split(":");
  const refEndValue = refParts2.length > 1 ? refParts2[1] : refParts2[0];
  const endMatch = refEndValue ? refEndValue.match(/([A-Z]+)(\d+)$/i) : null;
  if (!endMatch || !endMatch[2]) return;
  const endRow = Number(endMatch[2]);

  const expectedEndRow = Math.max(1, 1 + Math.max(0, dataRowCount));
  const finalEndRow = Math.max(expectedEndRow, maxRowWithValue);

  // Regardless of whether the existing '!ref' matched the trimmed range, ensure
  // that any cell keys beyond the finalEndRow are removed and the '!rows' array
  // is sliced to the finalEndRow to avoid writers adding extra blank rows.
  for (const k of cellKeys) {
    const m = k.match(/([A-Z]+)(\d+)$/i);
    if (!m) continue;
    const row = Number(m[2]);
    if (row > finalEndRow) delete (ws as Record<string, unknown>)[k];
  }
  (ws as Record<string, unknown>)["!ref"] = `${startCol}1:${endCol}${finalEndRow}`;
  const rowsProp = (ws as Record<string, unknown>)["!rows"];
  if (Array.isArray(rowsProp)) {
    (ws as Record<string, unknown>)["!rows"] = (rowsProp as unknown[]).slice(0, finalEndRow) as unknown;
  }
}
