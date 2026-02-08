/**
 * Types for QuickBooks Online "Report" API responses.
 * These can be used to construct more collapsed types for specific reports,
 * or perform filtering on the per-row data.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

// Public Types --------------------------------------------------------------

export type Report = {
  Report?: Report;
  Columns?: ColumnsLike;
  Rows?: RowsLike;
  Header?: { Columns?: ColumnsLike } & Record<string, Json>;
} & Record<string, Json | RowsLike | ColumnsLike | RowLike | undefined>;

// Private (Subordinate) Types -----------------------------------------------

type Json = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject { [k: string]: Json; }
interface JsonArray { [n: number]: Json; }

export type ColDataLike = ColLike | string | number | JsonObject;

export type ColLike = {
  ColTitle?: string;
  ColType?: string;
  "#text"?: string;
  text?: string;
  label?: string;
  name?: string;
  value?: Json;
  amount?: string | number;
} & Record<string, Json>;

export type ColumnsLike = {
  Column?: ColLike | ColLike[];
  Col?: ColLike | ColLike[];
  ColData?: ColDataLike | ColDataLike[];
} & Record<string, Json>;

export type RowsLike = {
  Row?: RowLike | RowLike[];
} | RowLike[];

export type RowLike = {
  Rows?: RowsLike;
  Row?: RowLike | RowLike[];
  rows?: { row?: RowLike | RowLike[] } | RowLike[];
  ColData?: ColDataLike | ColDataLike[];
  Columns?: ColumnsLike;
  Header?: { ColData?: ColDataLike | ColDataLike[]; value?: string } & Record<string, Json>;
  group?: string;
  title?: string;
} & Record<string, Json>;

