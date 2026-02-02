/**
 * Server side route to fetch information for a JournalReport from QBO,
 * including authentication if necessary.  The returned value will be
 * the JSON response from QBO, as filtered by the request parameters.
 */

// External Imports ----------------------------------------------------------

import { fetchApiInfo } from "@repo/qbo-api/AuthFunctions";
import { serverLogger as logger } from "@repo/shared-utils/*";
import { type NextRequest, NextResponse } from "next/server";

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {

  logger.debug("JournalReport GET starting");

  try {

    // Extract query parameters
    const requestUrl = new URL(request.url);
    const params = requestUrl.searchParams;
    // Start date (YYYY-MM-DD)
    const startDate = params.get("startDate");
    // End date (YYYY-MM-DD)
    const endDate = params.get("endDate");
    // Comma-delimited list of columns to include (Report Defaults if not present)
    const columns = params.get("columns") ||  null;
    // Comma-delimited list of columns to sort by (acct_num_with_extn,tx_date if not present)
    const sortBy = params.get("sortBy") || "acct_num_with_extn,tx_date";
    // Sort order (ascend if not present)
    const sortOrder = params.get("sortOrder") || "ascend";

    // Validate required parameters
    if (!startDate || !endDate) {
      logger.warn("JournalReport GET missing required parameters");
      return NextResponse.json(
        {error: "Missing required parameters: startDate and endDate"},
        {status: 400}
      );
    }
    if (!isValidYMD(startDate)) {
      logger.warn("JournalReport GET invalid startDate format");
      return NextResponse.json(
        {error: "startDate must be in YYYY-MM-DD format"},
        {status: 400}
      );
    }
    if (!isValidYMD(endDate)) {
      logger.warn("JournalReport GET invalid endDate format");
      return NextResponse.json(
        {error: "endDate must be in YYYY-MM-DD format"},
        {status: 400}
      );
    }
    if (endDate < startDate) {
      logger.warn("JournalReport GET endDate before startDate");
      return NextResponse.json(
        {error: "endDate must be on or after startDate"},
        {status: 400}
      );
    }
    if (!areValidColumns(columns)) {
      const invalidCols = areValidColumns(columns);
      logger.warn(
        `JournalReport GET invalid column names: ${invalidCols}`
      );
      return NextResponse.json(
        {error: `Invalid column names: ${invalidCols}`},
        {status: 400}
      );
    }
    if (!areValidColumns(sortBy)) {
      const invalidSortByCols = areValidColumns(sortBy);
      logger.warn(
        `JournalReport GET invalid sortBy column names: ${invalidSortByCols}`
      );
      return NextResponse.json(
        {error: `Invalid sortBy column names: ${invalidSortByCols}`},
        {status: 400}
      );
    }
    if (!isValidSortOrder(sortOrder)) {
      logger.warn("JournalReport GET invalid sortOrder value");
      return NextResponse.json(
        {error: `Invalid sortOrder: must be one of ${Array.from(SORT_ORDERS).join(", ")}`},
        {status: 400}
      );
    }

    // Fetch the authentication credentials
    const apiInfo = await fetchApiInfo(API_TIMEOUT);
    if (!apiInfo) {
      logger.error("JournalReport GET unable to fetch API info");
      return NextResponse.json(
        {error: "Unable to fetch API info"},
        {status: 500}
      );
    }

    // Construct the report URL
    const reportUrl = new URL(`${apiInfo.baseUrl}/v3/company/${apiInfo.realmId}/reports/JournalReport`);
    if (columns) {
      reportUrl.searchParams.set("columns", columns);
    }
    reportUrl.searchParams.set("end_date", endDate);
    reportUrl.searchParams.set("sort_by", sortBy);
    reportUrl.searchParams.set("sort_order", sortOrder);
    reportUrl.searchParams.set("start_date", startDate);

    // Fetch the report data from QBO
    const response = await fetch(reportUrl, {
      cache: "no-store",
      headers: {
        "Authorization": `Bearer ${apiInfo.accessToken}`,
        "Accept": "application/json",
      },
      method: "GET",
    });

    // Report any server reported errors
    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        `JournalReport GET QBO API error: ${response.status} - ${errorText}`
      );
      return NextResponse.json(
        {error: `QBO API error: ${response.status} - ${errorText}`},
        {status: response.status}
      );
    }

    // Return the report data to the caller
    const reportData = await response.json();
    logger.debug("JournalReport GET completed successfully");
    return NextResponse.json(reportData);

  } catch (error) {
    // Report any fetch errors
    logger.error(`JournalReport GET exception: ${error}`);
    return NextResponse.json(
      {error: `Exception occurred: ${error}`},
      {status: 500}
    );
  }

}

// Private Objects -----------------------------------------------------------

// Timeout for API requests (in milliseconds) must allow sufficient time
// for a user to manually authenticate if necessary.
const API_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Supported column names for this report.
// Those marked "Default" are included if no columns are specified.
const COLUMN_NAMES: Set<string> = new Set<string>([
  "account_name",          // Default
  "acct_num_with_extn",    // Default
  "create_by",
  "credit_amt",            // Default
  "create_date",
  "debt_amt",              // Default
  "doc_num",               // Default
  "due_date",              // Default
  "is_ap_paid",            // Default
  "is_ar_paid",            // Default
  "item_name",
  "journal_code_name",     // Default
  "last_mod_by",
  "last_mod_date",
  "memo",                  // Default
  "name",
  "neg_open_bal",
  "paid_date",             // Default
  "pmt_mthd",              // Default
  "quantity",
  "rate",
  "tx_date",                // Default
  "txn_num",                // Default
  "txn_type",               // Default
]);

// Valid SORT_ORDER values
const SORT_ORDERS: Set<string> = new Set<string>([
  "ascend",
  "descend",
]);

// Validate the columns parameter (if provided) contains only supported column names.
// Returns commas separated list of invalid column names, or null if all are valid
function areValidColumns(columns: string | null): string | null {
  if (!columns) {
    return null; // No columns specified, use defaults
  }
  const invalidColumns: string[] = [];
  const columnList = columns.split(",");
  for (const col of columnList) {
    if (!COLUMN_NAMES.has(col.trim())) {
      invalidColumns.push(col.trim());
    }
  }
  return invalidColumns.length > 0 ? invalidColumns.join(", ") : null;
}

// Validate the SORT_ORDER parameter
function isValidSortOrder(sortOrder: string): boolean {
  return SORT_ORDERS.has(sortOrder);
}

// Validate date string is in YYYY-MM-DD format and is a real date.
function isValidYMD(dateString: string): boolean {
  // Check format YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  // Check if it's a real date
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (isNaN(timestamp)) {
    return false;
  }
  return date.toISOString().startsWith(dateString);
}

