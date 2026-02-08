/**
 * Helper functions for managing QuickBooks Online reports.
 * These are used to extract data from the often-nested report responses,
 * and to perform common transformations on that data.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { ColDataLike, ColLike, /*ColumnsLike,*/ Report, RowLike } from "./types/QboReportTypes";

// Public Objects ------------------------------------------------------------

/**
 * Returns an array of column header labels from a QBO report, in the order they appear
 * in the report.
 *
 * @param report - The QBO report object to extract headers from
 * @returns An array of header labels as strings, in the order they appear in the report
 */
export const getReportHeaders = (report: Report): string[] => {
  const headers = normalizeHeaders(report);
  return headers.map(getHeaderLabel);
}

/**
 * Return a flattened array of the cell values from a Row of a QBO report,
 * in the order they appear in the report.
 *
 * @param report: Report): The QBO report object to extract row data from
 * @returns An array of column values for each Row, in the order they appear in the Row
 */
export const getReportRowValues = (report: Report): ColDataLike[] => {
  const rows = normalizeRows(report);
  return rows.map((row) => {
    const values = normalizeColData(row?.ColData ?? row?.Columns);
    return values.map(getCellValue);
  }).flat();
}

// Private Objects -----------------------------------------------------------

// helper to safely narrow unknown into an object for deeper property access
const asObj = (x: unknown): Record<string, unknown> | undefined => {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : undefined;
};

const getHeaderLabel = (h: unknown): string => {
  if (h == null) return "";
  if (typeof h === "string" || typeof h === "number") return String(h);
  if (typeof h === "object") {
    const o = h as Record<string, unknown>;
    return (
      String(o["ColTitle"] ?? o["title"] ?? o["label"] ?? o["name"] ?? o["value"] ?? o["text"] ?? o["#text"] ?? "")
    );
  }
  return "";
};

const getCellValue = (c: unknown): string => {
  if (c == null) return "";
  if (typeof c === "string" || typeof c === "number") return String(c);

  if (typeof c === "object") {
    const o = c as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(o, "value")) {
      const val = o["value"];
      if (val == null) return "";
      if (typeof val === "object") return getCellValue(val);
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

    if (isEmptyWrapper(o)) return "";

    try {
      return JSON.stringify(o);
    } catch {
      return String(o);
    }
  }

  return "";

};

const isEmptyWrapper = (obj: unknown): boolean => {
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
    if (typeof v === "object") return isEmptyWrapper(v);
    return false;
  });
};

const normalizeColData = (x: unknown): ColDataLike[] => {
  if (x == null) return [];
  if (Array.isArray(x)) return x as ColDataLike[];
  if (typeof x === "object") {
    const o = x as Record<string, unknown>;
    if (o["ColData"]) return normalizeColData(o["ColData"]);
    if (o["colData"]) return normalizeColData(o["colData"]);
    if (o["Col"]) return normalizeColData(o["Col"]);
    if (o["columns"]) return normalizeColData(o["columns"]);
    // numeric keys like "0", "1", ...
    const numericKeys = Object.keys(o).filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
    if (numericKeys.length) return numericKeys.map((k) => o[k] as ColDataLike);
    return [o as ColDataLike];
  }
  return [x as ColDataLike];
};

// Prefer top-level Columns/Column (contains ColTitle/ColType), then header variants
const normalizeHeaders = (report: unknown): ColLike[] => {
  const src = (report as Report)?.Report ?? (report as Report);
  const srcObj = asObj(src);

  const headerObj = asObj(srcObj?.["Header"]);
  const headerLower = asObj(srcObj?.["header"]);
  const colsObj = asObj(srcObj?.["Columns"]);

  const candidate =
    asObj(colsObj)?.["Column"] ??
    asObj(colsObj)?.["Col"] ??
    srcObj?.["Columns"] ??
    asObj(headerObj?.["Columns"])?.["Column"] ??
    asObj(headerObj?.["Columns"])?.["Col"] ??
    asObj(headerObj?.["ColHeaders"])?.["ColHeader"] ??
    headerLower?.["cols"] ??
    headerObj?.["Columns"] ??
    srcObj?.["columns"] ??
    headerObj?.["ColHeaders"] ??
    headerObj?.["Cols"] ??
    [];
  if (Array.isArray(candidate)) return candidate as ColLike[];
  if (candidate) return [candidate as ColLike];
  return [];
};

const normalizeRows = (reportOrRows: unknown): RowLike[] => {
  if (!reportOrRows) return [];
  const rr = reportOrRows as Record<string, unknown>;
  if (rr["Report"]) return normalizeRows(rr["Report"]);
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

