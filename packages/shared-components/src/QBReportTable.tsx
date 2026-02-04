// typescript
import React from 'react';

interface QBReportTableProps {
  report: any;
  className?: string;
}

const parseReportInput = (report: any): any => {
  if (report == null) return report;
  if (typeof report === 'string') {
    try {
      return JSON.parse(report);
    } catch {
      return report;
    }
  }
  return report;
};

const getHeaderLabel = (h: any): string => {
  if (!h) return '';
  return (
    h.ColTitle ||
    h.title ||
    h.label ||
    h.name ||
    h.value ||
    h.text ||
    h['#text'] ||
    (typeof h === 'string' ? h : '')
  );
};

const isEmptyWrapper = (obj: any): boolean => {
  if (obj == null) return true;
  if (typeof obj === 'string') return obj.trim() === '';
  if (typeof obj === 'number') return false;
  if (typeof obj !== 'object') return false;
  const keys = Object.keys(obj);
  if (keys.length === 0) return true;
  return keys.every(k => {
    const v = obj[k];
    if (v == null) return true;
    if (typeof v === 'string') return v.trim() === '';
    if (typeof v === 'object') return isEmptyWrapper(v);
    return false;
  });
};

const getCellValue = (c: any): string => {
  if (c == null) return '';
  if (typeof c === 'string' || typeof c === 'number') return String(c);

  if (typeof c === 'object' && Object.prototype.hasOwnProperty.call(c, 'value')) {
    const val = (c as any).value;
    if (val == null) return '';
    if (typeof val === 'object') return getCellValue(val);
    return String(val);
  }

  const pick = (obj: any): string => {
    if (obj == null) return '';
    if (typeof obj === 'string' || typeof obj === 'number') return String(obj);
    if (obj['#text'] != null) return String(obj['#text']);
    if (obj.text != null) return String(obj.text);
    if (obj.name != null) return String(obj.name);
    if (obj.amount != null) return String(obj.amount);
    if (obj.label != null) return String(obj.label);
    if (typeof obj.value === 'object') return pick(obj.value);
    return '';
  };

  const v = pick(c);
  if (v !== '') return v;

  if (isEmptyWrapper(c)) return '';

  try {
    return JSON.stringify(c);
  } catch {
    return String(c);
  }
};

// Prefer top-level Columns/Column (contains ColTitle/ColType), then header variants
const normalizeHeaders = (report: any): any[] => {
  const src = report?.Report ?? report;
  const candidate =
    src?.Columns?.Column ||
    src?.Columns?.Col ||
    src?.Columns ||
    src?.Header?.Columns?.Column ||
    src?.Header?.Columns?.Col ||
    src?.Header?.ColHeaders?.ColHeader ||
    src?.header?.cols ||
    src?.Header?.Columns ||
    src?.columns ||
    src?.Header?.ColHeaders ||
    src?.Header?.Cols ||
    [];
  return Array.isArray(candidate) ? candidate : candidate ? [candidate] : [];
};

const normalizeRows = (reportOrRows: any): any[] => {
  if (!reportOrRows) return [];
  if (reportOrRows?.Report) return normalizeRows(reportOrRows.Report);
  if (Array.isArray(reportOrRows)) return reportOrRows;
  if (reportOrRows?.Rows?.Row) return Array.isArray(reportOrRows.Rows.Row) ? reportOrRows.Rows.Row : [reportOrRows.Rows.Row];
  if (reportOrRows?.Row) return Array.isArray(reportOrRows.Row) ? reportOrRows.Row : [reportOrRows.Row];
  if (reportOrRows?.rows?.row) return Array.isArray(reportOrRows.rows.row) ? reportOrRows.rows.row : [reportOrRows.rows.row];
  if (reportOrRows?.rows) return Array.isArray(reportOrRows.rows) ? reportOrRows.rows : [reportOrRows.rows];
  return [];
};

const normalizeColData = (x: any): any[] => {
  if (x == null) return [];
  if (Array.isArray(x)) return x;
  if (x.ColData) return normalizeColData(x.ColData);
  if (x.colData) return normalizeColData(x.colData);
  if (x.Col) return normalizeColData(x.Col);
  if (x.columns) return normalizeColData(x.columns);
  if (typeof x === 'object') {
    const numericKeys = Object.keys(x).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
    if (numericKeys.length) return numericKeys.map(k => x[k]);
    return [x];
  }
  return [x];
};

export const QBReportTable: React.FC<QBReportTableProps> = ({ report, className }) => {
  const parsedReport = parseReportInput(report);
  const topRows = normalizeRows(parsedReport);
  const explicitHeaders = normalizeHeaders(parsedReport);

  // Derive header labels: prefer explicit headers (now includes top-level Columns/Column)
  const headerLabels: string[] = (() => {
    const explicitLabels = explicitHeaders.map(getHeaderLabel);
    if (explicitLabels.some(l => l && l.trim() !== '')) return explicitLabels;

    // If explicit headers exist but are all empty, still prefer their shape (use blank labels)
    if (explicitHeaders.length > 0) return explicitHeaders.map(() => '');

    // Fallback: infer column count from data rows (skip section rows)
    let maxCols = 0;
    const stack: any[] = [...topRows];
    while (stack.length) {
      const r = stack.shift();
      if (!r) continue;
      const children = normalizeRows(r?.Rows);
      if (children.length) {
        stack.push(...children);
        continue;
      }
      const raw = r?.ColData ?? r?.Columns ?? r?.Col ?? r?.Header?.ColData ?? r?.Header;
      const colCount = normalizeColData(raw).length;
      if (colCount > maxCols) maxCols = colCount;
    }
    if (maxCols === 0) maxCols = 1;
    return Array.from({ length: maxCols }).map(() => '');
  })();

  const rowIdMapRef = React.useRef<WeakMap<object, number>>(new WeakMap());
  const idCounterRef = React.useRef(0);
  const getRowStableId = (r: any): number => {
    if (r && typeof r === 'object') {
      const map = rowIdMapRef.current;
      let id = map.get(r);
      if (!id) {
        idCounterRef.current += 1;
        id = idCounterRef.current;
        map.set(r, id);
      }
      return id;
    }
    idCounterRef.current += 1;
    return idCounterRef.current;
  };

  const tableStyle: React.CSSProperties = { borderCollapse: 'collapse', width: '100%' };
  const cellBaseStyle: React.CSSProperties = { border: '1px solid #e0e0e0', padding: '6px 8px', textAlign: 'left' };

  const renderRows = (rows: any[], level = 0): React.ReactNode[] => {
    return rows.flatMap((r: any, idx: number) => {
      const stableId = getRowStableId(r);
      const baseKey = `${level}-${stableId}-${idx}`;

      const rawCells = r?.ColData ?? r?.Columns ?? r?.Col ?? r?.Header?.ColData ?? r?.Header;
      const colDataArray = normalizeColData(rawCells);
      const childrenRows = normalizeRows(r?.Rows);
      const nodes: React.ReactNode[] = [];

      if (childrenRows.length > 0) {
        let sectionLabel = '';
        if (Array.isArray(r?.Header?.ColData) && r.Header.ColData.length > 0) {
          sectionLabel = r.Header.ColData.map(getCellValue).join(' ');
        } else if (Array.isArray(colDataArray) && colDataArray.length > 0) {
          sectionLabel = colDataArray.map(getCellValue).join(' ');
        } else if (r?.group) {
          sectionLabel = String(r.group);
        } else if (r?.title) {
          sectionLabel = String(r.title);
        } else if (r?.Header?.value) {
          sectionLabel = String(r.Header.value);
        }

        nodes.push(
          <tr key={`${baseKey}-section`} className="qbo-section-row">
            <td
              colSpan={Math.max(1, headerLabels.length)}
              style={{ paddingLeft: `${level * 16}px`, fontWeight: 600, ...cellBaseStyle }}
            >
              {sectionLabel || '(section)'}
            </td>
          </tr>
        );

        nodes.push(...renderRows(childrenRows, level + 1));
        return nodes;
      }

      nodes.push(
        <tr key={`${baseKey}-data`} className="qbo-data-row">
          {colDataArray.map((c: any, ci: number) => {
            const indentStyle = ci === 0 ? { paddingLeft: `${level * 16}px` } : undefined;
            return (
              <td key={`${baseKey}-c-${ci}`} style={{ ...cellBaseStyle, ...indentStyle }}>
                {getCellValue(c)}
              </td>
            );
          })}
          {Array.from({ length: Math.max(0, headerLabels.length - colDataArray.length) }).map((_, padIdx) => (
            <td key={`${baseKey}-pad-${padIdx}`} style={cellBaseStyle} />
          ))}
        </tr>
      );

      return nodes;
    });
  };

  return (
    <div className={className || 'qbo-report-table-wrapper'}>
      <table className="qbo-report-table" style={tableStyle}>
        <thead>
          <tr>
            {headerLabels.map((h: any, i: number) => (
              <th key={`hdr-${i}`} style={cellBaseStyle}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderRows(topRows, 0)}</tbody>
      </table>
    </div>
  );
};
