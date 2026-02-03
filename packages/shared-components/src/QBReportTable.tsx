"use client";

import React, { useMemo } from 'react';

type ColDef = { ColTitle?: string; ColType?: string };
type ColDataItem = { value?: string; id?: string };
type RowItem = {
  ColData?: ColDataItem[];
  Summary?: { ColData?: ColDataItem[] };
  type?: string;
};

interface Report {
  Columns?: { Column?: ColDef[] };
  Rows?: { Row?: RowItem[] };
}

interface Props {
  reportJsonText: string;
  className?: string;
  tableStyle?: React.CSSProperties;
}

/*
  QBReportTable
  - Parses the provided JSON text.
  - Builds headers from report.Columns.Column[*].ColTitle (fallback to ColType).
  - Renders each report.Rows.Row[*] using ColData or Summary.ColData.
  - Marks rows where row.type === 'Section' or row.Summary exists as a summary row.
*/
export const QBReportTable: React.FC<Props> = ({ reportJsonText, className, tableStyle }) => {
  const parseResult = useMemo(() => {
    try {
      return JSON.parse(reportJsonText) as Report;
    } catch {
      return null;
    }
  }, [reportJsonText]);

  if (!parseResult) {
    return <div style={{ color: 'red' }}>Invalid report JSON</div>;
  }

  const columns = Array.isArray(parseResult.Columns?.Column) ? parseResult.Columns!.Column! : [];
  const rows = Array.isArray(parseResult.Rows?.Row) ? parseResult.Rows!.Row! : [];

  // If columns are missing, derive a column count from the longest row
  const derivedColCount = Math.max(
    columns.length,
    ...rows.map((r) => {
      const cols = r.ColData ?? r.Summary?.ColData ?? [];
      return Array.isArray(cols) ? cols.length : 0;
    }),
    0
  );

  const headerTitles: string[] = [];
  const headerTypes: string[] = [];
  if (columns.length > 0) {
    for (let i = 0; i < columns.length; i++) {
      headerTitles.push(columns[i]?.ColTitle ?? columns[i]?.ColType ?? `Col ${i + 1}`);
      headerTypes.push(columns[i]?.ColType ?? 'string');
    }
  } else {
    for (let i = 0; i < derivedColCount; i++) headerTitles.push(`Col ${i + 1}`);
  }
  console.log("Header Titles: " + headerTitles.join('|'));
  console.log("Header Types:  " + headerTypes.join('|'));

  const txnTypeColIndex = columns.findIndex((col) => col.ColType === 'txn_type');
  const txnTypes: Set<string> = new Set();
  if (txnTypeColIndex >= 0) {
    rows.forEach((r) => {
      const colData = r.ColData ?? r.Summary?.ColData ?? [];
      if (Array.isArray(colData)) {
        const cell = colData[txnTypeColIndex];
        if (cell?.value) {
          txnTypes.add(cell.value);
        }
      }
    });
    console.log("txnTypes: " + txnTypes.size + " [" + Array.from(txnTypes).join('|') + "]");
  }

  const tableDefaultStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    ...tableStyle,
  };

  const thTdStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '6px 8px',
    textAlign: 'left',
    fontSize: 13,
  };

  const summaryRowStyle: React.CSSProperties = {
    fontWeight: 600,
    background: '#f7f7f7',
  };

  return (
    <div className={className}>
      <table style={tableDefaultStyle}>
        <thead>
        <tr>
          {headerTitles.map((t, i) => (
            <th key={i} style={{ ...thTdStyle, background: '#fafafa' }}>
              {t}
            </th>
          ))}
        </tr>
        </thead>

        <tbody>
        {rows.map((r, rIdx) => {
          const colData = r.ColData ?? r.Summary?.ColData ?? [];
          const isSummary = r.type === 'Section' || !!r.Summary;

          return (
            <tr key={rIdx} style={isSummary ? summaryRowStyle : undefined}>
              {headerTitles.map((_, cIdx) => {
                const cell = Array.isArray(colData) ? colData[cIdx] : undefined;
                const value = cell?.value ?? '';
                return (
                  <td key={cIdx} style={thTdStyle}>
                    {value}
                  </td>
                );
              })}
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};

export default QBReportTable;
