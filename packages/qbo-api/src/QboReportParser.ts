/**
 * Function to parse the report data from QuickBooks Online API response,
 * and return it in a more normalized and consistent format.
 */

// External Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils/*";

// Internal Modules ----------------------------------------------------------

import type {
  ParsedColumn,
  ParsedHeader,
  ParsedHeaderOption,
  ParsedReport,
  ParsedRow,
} from "./types/QboReportParsedTypes";
import type { Report, RowLike, ColDataLike } from "./types/QboReportTypes";

// Public Objects ------------------------------------------------------------

/**
 * High-level entrypoint: parse an entire QBO report into normalized pieces.
 */
export const parseReport = (report: Report) => {
  logger.info({ context: "QboReportParser.parseReport.in" });
  return {
    columns: parseColumns(report),
    header: parseHeader(report),
    rows: parseRows(report),
  } as unknown as ParsedReport;
}

// Private Objects -----------------------------------------------------------

// helper to safely narrow unknown into an object for deeper property access
const asObject = (x: unknown): Record<string, unknown> | undefined => {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : undefined;
};

const getCellValueLocal = (c: unknown): string => {
  if (c == null) return "";
  if (typeof c === "string" || typeof c === "number") return String(c);

  if (typeof c === "object") {
    const o = c as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(o, "value")) {
      const val = o["value"];
      if (val == null) return "";
      if (typeof val === "object") return getCellValueLocal(val);
      return String(val);
    }

    const pick = (obj: Record<string, unknown> | string | number | null | undefined): string => {
      if (obj == null) return "";
      if (typeof obj === "string" || typeof obj === "number") return String(obj);
      if (typeof obj === "object") {
        const ro = obj as Record<string, unknown>;
        if (typeof ro["#text"] !== "undefined") return String(ro["#text"]);
        if (typeof ro["text"] !== "undefined") return String(ro["text"]);
        if (typeof ro["name"] !== "undefined") return String(ro["name"]);
        if (typeof ro["amount"] !== "undefined") return String(ro["amount"]);
        if (typeof ro["label"] !== "undefined") return String(ro["label"]);
        if (typeof ro["value"] === "object") return pick(ro["value"] as Record<string, unknown>);
      }
      return "";
    };

    const v = pick(o);
    if (v !== "") return v;

    if (isEmptyWrapperLocal(o)) return "";

    try {
      return JSON.stringify(o);
    } catch {
      return String(o);
    }
  }

  return "";
};

// helper to normalize header Option entries (handle Name/Value or name/value)
const getOptionPair = (opt: unknown): ParsedHeaderOption => {
  const o = asObject(opt);
  if (!o) return { name: "", value: "" };
  const name = typeof o.Name === "string" ? o.Name : (typeof o.name === "string" ? o.name : "");
  const value = typeof o.Value === "string" ? o.Value : (typeof o.value === "string" ? o.value : "");
  return { name, value };
};

// Local helpers used by parseRows (self-contained)
const isEmptyWrapperLocal = (obj: unknown): boolean => {
  if (obj == null) return true;
  if (typeof obj === "string") return obj.trim() === "";
  if (typeof obj === "number") return false;
  if (typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length === 0) return true;
  return keys.every((k) => {
    const v = o[k];
    if (v == null) return true;
    if (typeof v === "string") return v.trim() === "";
    if (typeof v === "object") return isEmptyWrapperLocal(v);
    return false;
  });
};

const normalizeColDataLocal = (x: unknown): ColDataLike[] => {
  if (x == null) return [];
  if (Array.isArray(x)) return x as ColDataLike[];
  if (typeof x === "object") {
    const o = x as Record<string, unknown>;
    if (o["ColData"]) return normalizeColDataLocal(o["ColData"]);
    if (o["colData"]) return normalizeColDataLocal(o["colData"]);
    if (o["Col"]) return normalizeColDataLocal(o["Col"]);
    if (o["columns"]) return normalizeColDataLocal(o["columns"]);
    const numericKeys = Object.keys(o).filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
    if (numericKeys.length) return numericKeys.map((k) => o[k] as ColDataLike);
    return [o as ColDataLike];
  }
  return [x as ColDataLike];
};

const normalizeRowsLocal = (reportOrRows: unknown): RowLike[] => {
  if (!reportOrRows) return [];
  const rr = reportOrRows as Record<string, unknown>;
  if (rr["Report"]) return normalizeRowsLocal(rr["Report"]);
  if (Array.isArray(reportOrRows)) return reportOrRows as RowLike[];
  if (rr["Rows"] && (rr["Rows"] as Record<string, unknown>)["Row"]) {
    const r = (rr["Rows"] as Record<string, unknown>)["Row"];
    return Array.isArray(r) ? (r as RowLike[]) : [r as RowLike];
  }
  if (rr["Row"]) {
    const r = rr["Row"];
    return Array.isArray(r) ? (r as RowLike[]) : [r as RowLike];
  }
  if (rr["rows"] && typeof rr["rows"] === "object") {
    const rowsObj = rr["rows"] as Record<string, unknown>;
    if (rowsObj["row"]) {
      const r = rowsObj["row"];
      return Array.isArray(r) ? (r as RowLike[]) : [r as RowLike];
    }
    if (Array.isArray(rowsObj)) return rowsObj as RowLike[];
  }
  if (rr["rows"] && Array.isArray(rr["rows"])) {
    return rr["rows"] as RowLike[];
  }
  return [];
};

/**
 * Parse the "Column" elements of a QBO report.
 */
export const parseColumns = (report: Report): ParsedColumn[] => {

  const input = asObject(report.Columns);
  if (!input) {
    logger.warn({
      context: "QboReportParser.parseColumns",
      message: "Report columns are missing or not an object",
      columns: report.Columns,
    });
    return [];
  }
  if (!Array.isArray(input.Column)) {
    logger.warn({
      context: "QboReportParser.parseColumns",
      message: "Report columns are missing or not an array",
      columns: report.Columns,
    });
    return [];
  }

  const columns: ParsedColumn[] = [];
  input.Column.forEach((column) => {
    if (typeof column.ColTitle === "string" && typeof column.ColType === "string") {
      columns.push({
        title: column.ColTitle,
        type: column.ColType,
      });
    } else {
      logger.warn({
        context: "QboReportParser.parseColumns",
        message: "Report column is missing required properties",
        column,
      });
    }
  });
  return columns;

}

/**
 * Parse the "Header" element of a QBO report.
 */
export const parseHeader = (report: Report): ParsedHeader | undefined => {

  const input = asObject(report.Header);
  if (!input) {
    logger.warn({
      context: "QboReportParser.parseHeader",
      message: "Report header is missing or not an object",
      header: report.Header,
    });
    return undefined;
  }

  const header: ParsedHeader = {
    currency: typeof input.Currency === "string" ? input.Currency : undefined,
    endPeriod: typeof input.EndPeriod === "string" ? input.EndPeriod : "",
    options: Array.isArray(input.Option) ? input.Option.map((opt) => getOptionPair(opt)) : undefined,
    reportName: typeof input.ReportName === "string" ? input.ReportName : undefined,
    startPeriod: typeof input.StartPeriod === "string" ? input.StartPeriod : "",
    time: typeof input.Time === "string" ? new Date(input.Time) : undefined,
  };
  logger.trace({
    context: "QboReportParser.parseHeader",
    header,
  })
  return header;

}

/**
 * Parse the "Rows" elements of a QBO report, including any nested rows, and return a flattened array of parsed rows.
 */
export const parseRows = (report: Report): ParsedRow[] => {

  // Use normalizeRows to get a consistent list of RowLike objects and then
  // flatten nested rows by descending into child Rows until we reach data rows.
  const topRows = normalizeRowsLocal(report);
  const parsed: ParsedRow[] = [];

  const processRow = (r: Record<string, unknown>) => {
    // children
    const children = normalizeRowsLocal(asObject(r.Rows) ?? r.rows);
    if (children.length > 0) {
      children.forEach((ch: RowLike) => processRow(ch as Record<string, unknown>));
      return;
    }

    // it's a data row: extract col data
    const raw = (r.ColData ?? r.Columns ?? r.Col ?? asObject(r.Header)?.ColData ?? asObject(r.Header)) as unknown;
    const colArray = normalizeColDataLocal(raw);

    const cols = colArray.map((cd: ColDataLike) => {
      if (cd == null) return { value: "" } as { id?: string; value: string };
      if (typeof cd === "string" || typeof cd === "number") {
        return { value: String(cd) } as { id?: string; value: string };
      }
      const obj = cd as Record<string, unknown>;
      const id = typeof obj.id === "string" ? obj.id : (typeof obj.Id === "string" ? obj.Id : (typeof obj.name === "string" ? obj.name : undefined));
      const value = getCellValueLocal(obj);
      return { id, value } as { id?: string; value: string };
    });

    const type = typeof r.group === "string"
      ? r.group
      : (typeof r.title === "string" ? r.title : (String(asObject(r.Header)?.value ?? "")));

    // Map to the ParsedRowColumn shape
    const parsedCols = cols.map((c: { id?: string; value: string }) => ({ id: c.id, value: c.value }));

    // Exclude section header rows and rows that contain only empty values
    const typeNorm = (type ?? "").toString().trim().toLowerCase();
    if (typeNorm === "section") return; // omit section rows

    const allEmpty = parsedCols.length === 0 || parsedCols.every((c) => (c.value ?? "").toString().trim() === "");
    if (allEmpty) return; // omit rows with no meaningful data

    parsed.push({
      columns: parsedCols,
      type,
    });
  };

  topRows.forEach((tr: RowLike) => processRow(tr as Record<string, unknown>));
  return parsed;
}

// Reference exported functions to satisfy some linters/static checkers that
// flag exported-but-unused symbols in the local workspace scan.
void parseReport;
