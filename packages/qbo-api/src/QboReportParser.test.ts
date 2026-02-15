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

describe('QboReportParser.parseReport - complex inputs', () => {
  it('handles complex ColData shapes, header options, nested rows, and numeric values', () => {
    const report = {
      Columns: { Column: [ { ColTitle: 'A', ColType: 'string' }, { ColTitle: 'B', ColType: 'string' } ] },
      Header: { ReportName: 'Complex', Option: [ { Name: 'opt1', Value: 'val1' }, { name: 'opt2', value: 'val2' } ] },
      Rows: {
        Row: [
          // regular data row with mixed ColData shapes
          { ColData: [ { id: 'c1', value: { '#text': 'v1' } }, { value: { id: 'c2', name: 'n2' } } ] },
          // section row that should be omitted but whose children should be flattened
          { title: 'Section', Rows: { Row: [ { ColData: [ { '#text': 'child1' }, 42 ] } ] } },
          // an all-empty row that should be omitted
          { ColData: [ '', { value: '' }, { '#text': '' } ] }
        ]
      }
    } as unknown as Report;

    const pr = parseReport(report);

    // columns and header
    expect(pr.columns).toHaveLength(2);
    expect(pr.header).toBeDefined();
    expect(pr.header!.reportName).toBe('Complex');
    expect(pr.header!.options).toBeDefined();
    expect(pr.header!.options).toHaveLength(2);
    expect(pr.header!.options![0]).toEqual({ name: 'opt1', value: 'val1' });
    expect(pr.header!.options![1]).toEqual({ name: 'opt2', value: 'val2' });

    // rows: first data row + child from section (second row), third row omitted
    expect(pr.rows).toHaveLength(2);

    const r0 = pr.rows[0]!;
    expect(r0.columns).toHaveLength(2);
    const r0c0 = r0.columns[0]!;
    const r0c1 = r0.columns[1]!;
    expect(r0c0.id).toBe('c1');
    expect(r0c0.value).toBe('v1');
    // second column had value object with id/name; id extraction looks at obj.id/Id/name
    expect(r0c1.id).toBe('c2');

    const r1 = pr.rows[1]!;
    // child row: first column is 'child1', second column is numeric 42 -> '42'
    expect(r1.columns).toHaveLength(2);
    const r1c0 = r1.columns[0]!;
    const r1c1 = r1.columns[1]!;
    expect(r1c0.value).toBe('child1');
    expect(r1c1.value).toBe('42');
  });
});

describe('QboReportParser additional real-world style cases', () => {
  it('handles deeply nested rows (multiple section levels) and flattens to leaf data rows', () => {
    const report = {
      Rows: {
        Row: [
          {
            title: 'TopSection',
            Rows: {
              Row: [
                {
                  title: 'InnerSection',
                  Rows: {
                    Row: [
                      { ColData: [ { '#text': 'deep1' }, { amount: -5 } ] },
                      { ColData: [ { '#text': 'deep2' }, { amount: 0 } ] }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    } as unknown as Report;

    const rows = parseRows(report);
    expect(rows).toHaveLength(2);
    const a = rows[0]!; const b = rows[1]!;
    expect(a.columns).toHaveLength(2);
    const a0 = a.columns[0]!;
    const a1 = a.columns[1]!;
    expect(a0.value).toBe('deep1');
    expect(a1.value).toBe('-5');
    expect(b.columns).toHaveLength(2);
    const b0 = b.columns[0]!;
    const b1 = b.columns[1]!;
    expect(b0.value).toBe('deep2');
    expect(b1.value).toBe('0');
  });

  it('uses Header.ColData when row has no ColData', () => {
    const report = {
      Rows: {
        Row: [
          { Header: { ColData: [ { '#text': 'hdr1' }, { amount: 100 } ] } },
          { Header: { ColData: [ { '#text': 'hdr2' }, { amount: 200 } ] } }
        ]
      }
    } as unknown as Report;

    const rows = parseRows(report);
    expect(rows).toHaveLength(2);
    const r0 = rows[0]!;
    expect(r0.columns).toHaveLength(2);
    const r0c0 = r0.columns[0]!;
    const r0c1 = r0.columns[1]!;
    expect(r0c0.value).toBe('hdr1');
    expect(r0c1.value).toBe('100');
  });

  it('omits deeply nested rows when leaf rows contain only empty values', () => {
    const report = {
      Rows: {
        Row: [
          {
            title: 'lvl1',
            Rows: {
              Row: [
                {
                  title: 'lvl2',
                  Rows: {
                    Row: [
                      { ColData: [ '', { value: '' } ] }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    } as unknown as Report;

    const rows = parseRows(report);
    expect(rows).toHaveLength(0);
  });
});

describe('QboReportParser additional edge cases', () => {
  it('handles report wrapped inside top-level Report property', () => {
    const wrapped = {
      Report: {
        Columns: { Column: [ { ColTitle: 'C1', ColType: 'string' } ] },
        Header: { ReportName: 'Wrapped', Time: '2021-05-01T12:00:00Z' },
        Rows: { Row: [ { ColData: ['w1'] } ] }
      }
    } as unknown as Report;

    const pr = parseReport(wrapped as unknown as Report);
    expect(pr.columns).toHaveLength(1);
    expect(pr.header).toBeDefined();
    expect(pr.header!.reportName).toBe('Wrapped');
    expect(pr.header!.time).toBeInstanceOf(Date);
    expect(pr.rows).toHaveLength(1);
    const prow0 = pr.rows[0]!;
    expect(prow0.columns).toHaveLength(1);
    const prow0c0 = prow0.columns[0]!;
    expect(prow0c0.value).toBe('w1');
  });

  it('handles ColData given as numeric-keyed object', () => {
    const report = {
      Rows: {
        Row: [ { ColData: { '0': { '#text': 'n0' }, '1': { amount: 10 } } } ]
      }
    } as unknown as Report;
    const rows = parseRows(report);
    expect(rows).toHaveLength(1);
    const r = rows[0]!;
    expect(r.columns).toHaveLength(2);
    const r0c = r.columns[0]!;
    const r1c = r.columns[1]!;
    expect(r0c.value).toBe('n0');
    expect(r1c.value).toBe('10');
  });

  it('handles rows that use Columns instead of ColData', () => {
    const report = {
      Rows: {
        Row: [ { Columns: [ { value: 'col1' }, { value: 'col2' } ] } ]
      }
    } as unknown as Report;
    const rows = parseRows(report);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.columns.map((c) => c.value)).toEqual(['col1','col2']);
  });
});

describe('QboReportParser extra variants', () => {
  it('extracts Id capitalized and nested Id inside value', () => {
    const report = {
      Rows: {
        Row: [
          { ColData: [ { Id: 'ID1', value: 'val1' }, { value: { Id: 'ID2', '#text': 'v2' } } ] }
        ]
      }
    } as unknown as Report;

    const rows = parseRows(report);
    expect(rows).toHaveLength(1);
    const r = rows[0]!;
    expect(r.columns).toHaveLength(2);
    const c0 = r.columns[0]!; const c1 = r.columns[1]!;
    expect(c0.id).toBe('ID1');
    expect(c0.value).toBe('val1');
    expect(c1.id).toBe('ID2');
    expect(c1.value).toBe('v2');
  });

  it('handles lowercase `rows` property and numeric cell text fields', () => {
    const report = {
      rows: [ { Row: [ { ColData: [ { text: 't1' }, { label: 'L2' } ] } ] } ]
    } as unknown as Report;

    const rows = parseRows(report);
    expect(rows).toHaveLength(1);
    const r = rows[0]!;
    expect(r.columns).toHaveLength(2);
    expect(r.columns[0]!.value).toBe('t1');
    expect(r.columns[1]!.value).toBe('L2');
  });

  it('omits section rows regardless of case/whitespace and keeps child rows', () => {
    const report = {
      Rows: {
        Row: [
          { title: '  sEcTiOn  ', Rows: { Row: [ { ColData: ['childX'] } ] } }
        ]
      }
    } as unknown as Report;

    const rows = parseRows(report);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.columns[0]!.value).toBe('childX');
  });
});

describe('QboReportParser.date normalization', () => {
  it('inherits tx_date values when child rows omit the date (ColType tx_date)', () => {
    const report = {
      Columns: { Column: [ { ColTitle: 'Date', ColType: 'tx_date' }, { ColTitle: 'Amount', ColType: 'number' } ] },
      Rows: {
        Row: [
          { ColData: [ '2021-01-01', 100 ] },
          { ColData: [ '0-00-00', 50 ] }, // should inherit 2021-01-01
          { ColData: [ '', 25 ] },       // should inherit 2021-01-01
          { ColData: [ '2021-01-02', 200 ] },
          { ColData: [ '0-00-00', 75 ] }  // should inherit 2021-01-02
        ]
      }
    } as unknown as Report;

    const pr = parseReport(report);
    expect(pr.rows).toHaveLength(5);
    expect(pr.rows[0]!.columns[0]!.value).toBe('2021-01-01');
    expect(pr.rows[1]!.columns[0]!.value).toBe('2021-01-01');
    expect(pr.rows[2]!.columns[0]!.value).toBe('2021-01-01');
    expect(pr.rows[3]!.columns[0]!.value).toBe('2021-01-02');
    expect(pr.rows[4]!.columns[0]!.value).toBe('2021-01-02');
  });

  it('falls back to header title containing date when tx_date type is absent', () => {
    const report = {
      Columns: { Column: [ { ColTitle: 'Txn Date', ColType: 'string' }, { ColTitle: 'Amount', ColType: 'number' } ] },
      Rows: {
        Row: [
          { ColData: [ '2022-03-10', 10 ] },
          { ColData: [ '0-00-00', 20 ] },
          { ColData: [ '', 30 ] }
        ]
      }
    } as unknown as Report;

    const pr = parseReport(report);
    expect(pr.rows).toHaveLength(3);
    expect(pr.rows[0]!.columns[0]!.value).toBe('2022-03-10');
    expect(pr.rows[1]!.columns[0]!.value).toBe('2022-03-10');
    expect(pr.rows[2]!.columns[0]!.value).toBe('2022-03-10');
  });

  it('does not invent dates when the report starts with missing dates (leading-empty)', () => {
    const report = {
      Columns: { Column: [ { ColTitle: 'Date', ColType: 'tx_date' }, { ColTitle: 'Amount', ColType: 'number' } ] },
      Rows: {
        Row: [
          { ColData: [ '0-00-00', 10 ] }, // leading missing
          { ColData: [ '', 20 ] },       // leading missing
          { ColData: [ '2023-05-01', 30 ] },
          { ColData: [ '0-00-00', 40 ] }  // should inherit 2023-05-01
        ]
      }
    } as unknown as Report;

    const pr = parseReport(report);
    expect(pr.rows).toHaveLength(4);
    // first two rows have no prior date to inherit -> remain empty string
    expect(pr.rows[0]!.columns[0]!.value).toBe('');
    expect(pr.rows[1]!.columns[0]!.value).toBe('');
    // third row has explicit date
    expect(pr.rows[2]!.columns[0]!.value).toBe('2023-05-01');
    // fourth row should inherit the last non-empty date
    expect(pr.rows[3]!.columns[0]!.value).toBe('2023-05-01');
  });
});
