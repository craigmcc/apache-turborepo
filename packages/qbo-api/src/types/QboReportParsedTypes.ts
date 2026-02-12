/**
 * Types for data parsed from a QuickBooks Online "Report" API response,
 * in a more normalized and consistent format.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

// Public Types --------------------------------------------------------------

/**
 * The overall structure of a parsed QBO report, with normalized columns,
 * header, and rows, plus respecting naming conventions.
 */
export type ParsedReport = {
  // Definitions of each column in the report, in the order they appear
  // in the report.
  columns: ParsedColumn[];
  // The parsed version of the report header, if it exists.
  header?: ParsedHeader;
  // The parsed version of all report rows, now matter how they were
  // nested in the original report response.  NOTE: The order of rows is
  // likely to be preserved as it appears in the Report, but that is
  // not guaranteed.
  rows: ParsedRow[];
}

// Subordinate Types ---------------------------------------------------------

/**
 * Parsed version of a Report column definition, with normalized
 * properties and naming conventions.
 */
export type ParsedColumn = {
  // The label for this column, as it appears in the report header.
  title: string;
  // The internal definition (QBO column id) of this column's data type.
  type: string;
}

/**
 * Parsed version of a Report header definition, with normalized
 * properties and naming conventions.
 */
export type ParsedHeader = {
  // We do not currently care about currency (assumed to be USD)
  currency?: string;
  // End date for this report (YYYY-MM-DD).
  endPeriod: string;
  // Options defined for this report
  options?: ParsedHeaderOption[];
  // Report name for this report.
  reportName?: string;
  // Start date for this report (YYYY-MM-DD).
  startPeriod: string;
  // Timestamp (UTC) for this report.
  time?: Date;
}

/**
 * Parsed version of a Report Header that includes
 * name and value properties.
 */
export type ParsedHeaderOption = {
  // Name of this header option.
  name: string;
  // Value of this header option, as a string.
  value: string;
}

/**
 * A parsed version of a Report Row, with normalized properties
 * and naming.
 */
export type ParsedRow = {
  // The column values for this row, in the order they appear in the
  // ParsedReports.column array.
  columns: ParsedRowColumn[];
  // The type of this row, as defined by the "group" property in the
  // original report response.  This is used to determine how to parse
  // the row's column values.
  type: string;
}

/**
 * Parsed version of a column value of a Row,
 * with normalized properties and naming conventions.
 */
export type ParsedRowColumn = {
  // QBO id for this column (depending on the data type, of course).
  id?: string;
  // The value of this column for this row, AS A STRING.
  value: string;
}
