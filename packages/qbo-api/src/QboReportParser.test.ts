import { describe, it, expect } from 'vitest';
import type { Report } from './types/QboReportTypes';
import { parseRows, parseReport } from './QboReportParser';

describe('QboReportParser.parseRows', () => {
  it('maps ColData to ParsedRow columns', () => {
    const report = { Rows: { Row: [ { ColData: [ { id: 'c1', value: 'x' }, 'y' ] } ] } } as unknown as Report;
    const rows = parseRows(report);
    expect(rows).toHaveLength(1);
    const first = rows[0]!; // non-null assertion after length check
    expect(first.columns.length).toBe(2);
    const col0 = first.columns[0]!;
    const col1 = first.columns[1]!;
    expect(col0.id).toBe('c1');
    expect(col0.value).toBe('x');
    expect(col1.value).toBe('y');
  });

  it('flattens nested rows and omits section header rows', () => {
    const report = { Rows: { Row: [ { title: 'Section', Rows: { Row: [ { ColData: ['child'] } ] } } ] } } as unknown as Report;
    const rows = parseRows(report);
    expect(rows).toHaveLength(1);
    const first = rows[0]!;
    const col0 = first.columns[0]!;
    expect(col0.value).toBe('child');
  });

  it('omits rows with all empty column values', () => {
    const report = { Rows: { Row: [ { ColData: [ '', { value: '' }, { '#text': '' } ] } ] } } as unknown as Report;
    const rows = parseRows(report);
    expect(rows).toHaveLength(0);
  });
});

describe('QboReportParser.parseReport', () => {
  it('parses columns, header, rows', () => {
    const report = {
      Columns: { Column: [ { ColTitle: 'A', ColType: 'string' } ] },
      Header: { ReportName: 'R', Time: '2020-01-01T00:00:00Z' },
      Rows: { Row: [ { ColData: ['v1'] } ] }
    };
    const pr = parseReport(report as unknown as Report);
    expect(pr.columns).toHaveLength(1);
    expect(pr.header).toBeDefined();
    expect(pr.header!.reportName).toBe('R');
    expect(pr.rows).toHaveLength(1);
  });
});
