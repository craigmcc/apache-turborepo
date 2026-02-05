// typescript
import React from "react";

type Json = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject { [k: string]: Json; }
interface JsonArray { [n: number]: Json; }

type ColLike = {
  ColTitle?: string;
  ColType?: string;
  "#text"?: string;
  text?: string;
  label?: string;
  name?: string;
  value?: Json;
  amount?: string | number;
} & Record<string, Json>;

type ColDataLike = ColLike | string | number | JsonObject;

type ColumnsLike = {
  Column?: ColLike | ColLike[];
  Col?: ColLike | ColLike[];
  ColData?: ColDataLike | ColDataLike[];
} & Record<string, Json>;

type RowsLike = {
  Row?: RowLike | RowLike[];
} | RowLike[];

type RowLike = {
  Rows?: RowsLike;
  Row?: RowLike | RowLike[];
  rows?: { row?: RowLike | RowLike[] } | RowLike[];
  ColData?: ColDataLike | ColDataLike[];
  Columns?: ColumnsLike;
  Header?: { ColData?: ColDataLike | ColDataLike[]; value?: string } & Record<string, Json>;
  group?: string;
  title?: string;
} & Record<string, Json>;

export type Report = {
  Report?: Report;
  Columns?: ColumnsLike;
  Rows?: RowsLike;
  Header?: { Columns?: ColumnsLike } & Record<string, Json>;
} & Record<string, Json | RowsLike | ColumnsLike | RowLike | undefined>;

export interface QBReportTableProps {
  report: Report;
  className?: string;
}

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

// helper to safely narrow unknown into an object for deeper property access
const asObj = (x: unknown): Record<string, unknown> | undefined => {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : undefined;
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

export const QBReportTable: React.FC<QBReportTableProps> = ({ report, className }) => {
  const parsedReport = report;
  const topRows = normalizeRows(parsedReport);
  const explicitHeaders = normalizeHeaders(parsedReport);

  // Derive header labels: prefer explicit headers (now includes top-level Columns/Column)
  const headerLabels: string[] = (() => {
    const explicitLabels = explicitHeaders.map(getHeaderLabel);
    if (explicitLabels.some((l) => l && l.trim() !== "")) return explicitLabels;

    if (explicitHeaders.length > 0) return explicitHeaders.map(() => "");

    let maxCols = 0;
    const stack: RowLike[] = [...topRows];
    while (stack.length) {
      const r = stack.shift();
      if (!r) continue;
      const children = normalizeRows(asObj((r as Record<string, unknown>)?.["Rows"]) ?? (r as Record<string, unknown>)?.["rows"]);
      if (children.length) {
        stack.push(...children);
        continue;
      }

      const rr = r as Record<string, unknown>;
      const headerObj = asObj(rr["Header"]);
      const raw = rr["ColData"] ?? rr["Columns"] ?? rr["Col"] ?? headerObj?.["ColData"] ?? headerObj;
      const colCount = normalizeColData(raw).length;
      if (colCount > maxCols) maxCols = colCount;
    }
    if (maxCols === 0) maxCols = 1;
    return Array.from({ length: maxCols }).map(() => "");
  })();

  const rowIdMapRef = React.useRef<WeakMap<object, number>>(new WeakMap());
  const idCounterRef = React.useRef(0);
  const getRowStableId = (r: RowLike | undefined): number => {
    if (r && typeof r === "object") {
      const map = rowIdMapRef.current;
      let id = map.get(r as object);
      if (!id) {
        idCounterRef.current += 1;
        id = idCounterRef.current;
        map.set(r as object, id);
      }
      return id;
    }
    idCounterRef.current += 1;
    return idCounterRef.current;
  };

  const tableStyle: React.CSSProperties = {
    borderCollapse: "collapse",
    width: "100%",
    tableLayout: "fixed",
    maxWidth: "100vw",
  };

  const cellBaseStyle: React.CSSProperties = {
    border: "1px solid #e0e0e0",
    padding: "6px 8px",
    textAlign: "left",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  };

  const renderRows = (rows: RowLike[], level = 0): React.ReactNode[] => {
    return rows.flatMap((r, idx) => {
      const stableId = getRowStableId(r);
      const baseKey = `${level}-${stableId}-${idx}`;

      const rr = r as Record<string, unknown>;
      const headerObj = asObj(rr["Header"]);
      const rawCells = rr["ColData"] ?? rr["Columns"] ?? rr["Col"] ?? headerObj?.["ColData"] ?? headerObj;
      const colDataArray = normalizeColData(rawCells);
      const childrenRows = normalizeRows(asObj(rr["Rows"]) ?? rr["rows"]);
      const nodes: React.ReactNode[] = [];

      if (childrenRows.length > 0) {
        let sectionLabel = "";
        if (headerObj && Array.isArray(headerObj?.["ColData"]) && (headerObj?.["ColData"] as ColDataLike[]).length > 0) {
          sectionLabel = (headerObj?.["ColData"] as ColDataLike[]).map(getCellValue).join(" ");
        } else if (Array.isArray(colDataArray) && colDataArray.length > 0) {
          sectionLabel = colDataArray.map(getCellValue).join(" ");
        } else if (rr["group"]) {
          sectionLabel = String(rr["group"]);
        } else if (rr["title"]) {
          sectionLabel = String(rr["title"]);
        } else if (headerObj?.["value"]) {
          sectionLabel = String(headerObj["value"]);
        }

        nodes.push(
          <tr key={`${baseKey}-section`} className="qbo-section-row">
            <td
              colSpan={Math.max(1, headerLabels.length)}
              style={{ paddingLeft: `${level * 16}px`, fontWeight: 600, ...cellBaseStyle }}
            >
              {sectionLabel || "(section)"}
            </td>
          </tr>
        );

        nodes.push(...renderRows(childrenRows, level + 1));
        return nodes;
      }

      nodes.push(
        <tr key={`${baseKey}-data`} className="qbo-data-row">
          {colDataArray.map((c, ci) => {
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
    <div className={className || "qbo-report-table-wrapper"} style={{ width: "100%", maxWidth: "100vw" }}>
      <table className="qbo-report-table" style={tableStyle}>
        <thead>
          <tr>
            {headerLabels.map((h, i) => (
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
