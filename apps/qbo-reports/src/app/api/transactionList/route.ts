/**
 * Server side route to fetch information for a TransactionList from QBO,
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

  logger.debug("TransactionList GET starting");

  try {

    // Extract query parameters
    const requestUrl = new URL(request.url);
    const params = requestUrl.searchParams;
    // Start date (YYYY-MM-DD)
    const startDate = params.get("startDate");
    // End date (YYYY-MM-DD)
    const endDate = params.get("endDate");
    // Comma-delimited list of columns to include (Report Defaults if not present)
    const columns = params.get("columns") ||
      "account_name,amount,doc_num,memo,name,subt_nat_amount,tx_date,txn_type";
    // Comma-delimited list of columns to sort by (account_name,tx_date if not present)
    const sortBy = params.get("sortBy") || "account_name,tx_date";
    // Sort order (ascend if not present)
    const sortOrder = params.get("sortOrder") || "ascend";
    // Comma-delimited list of columns to include (all if not present)
    const transaction_type = params.get("transaction_type") ||
      "Bill,BillPaymentCheck,CreditCardCredit,Expenditure";

    // Validate required parameters
    if (!startDate || !endDate) {
      logger.warn("TransactionList GET missing required parameters");
      return NextResponse.json(
        {error: "Missing required parameters: startDate and endDate"},
        {status: 400}
      );
    }
    if (!isValidYMD(startDate)) {
      logger.warn("TransactionList GET invalid startDate format");
      return NextResponse.json(
        {error: "startDate must be in YYYY-MM-DD format"},
        {status: 400}
      );
    }
    if (!isValidYMD(endDate)) {
      logger.warn("TransactionList GET invalid endDate format");
      return NextResponse.json(
        {error: "endDate must be in YYYY-MM-DD format"},
        {status: 400}
      );
    }
    if (endDate < startDate) {
      logger.warn("TransactionList GET endDate before startDate");
      return NextResponse.json(
        {error: "endDate must be on or after startDate"},
        {status: 400}
      );
    }
    const invalidCols = areValidColumns(columns);
    if (invalidCols) {
      logger.warn(
        `TransactionList GET invalid column names: ${invalidCols}`
      );
      return NextResponse.json(
        {error: `Invalid column names: ${invalidCols}`},
        {status: 400}
      );
    }
    const invalidTypes = areValidTransactionTypes(transaction_type);
    if (invalidTypes) {
      logger.warn(
        `TransactionList GET invalid transaction types: ${invalidTypes}`
      );
      return NextResponse.json(
        {error: `Invalid transaction types: ${invalidTypes}`},
        {status: 400}
      );
    }
    const invalidSortBy = areValidColumns(sortBy);
    if (invalidSortBy) {
      logger.warn(
        `TransactionList GET invalid sortBy column names: ${invalidSortBy}`
      );
      return NextResponse.json(
        {error: `Invalid sortBy column names: ${invalidSortBy}`},
        {status: 400}
      );
    }
    if (!isValidSortOrder(sortOrder)) {
      logger.warn("TransactionList GET invalid sortOrder value");
      return NextResponse.json(
        {error: `Invalid sortOrder: must be one of ${Array.from(SORT_ORDERS).join(", ")}`},
        {status: 400}
      );
    }

    // Fetch the authentication credentials
    const apiInfo = await fetchApiInfo(API_TIMEOUT);
    if (!apiInfo) {
      logger.error("TransactionList GET unable to fetch API info");
      return NextResponse.json(
        {error: "Unable to fetch API info"},
        {status: 500}
      );
    }

    // Construct the report URL
    const reportUrl = new URL(`${apiInfo.baseUrl}/v3/company/${apiInfo.realmId}/reports/TransactionList`);
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
        `TransactionList GET QBO API error: ${response.status} - ${errorText}`
      );
      return NextResponse.json(
        {error: `QBO API error: ${response.status} - ${errorText}`},
        {status: response.status}
      );
    }

    // Return the report data to the caller
    const reportData = await response.json();
    logger.info({context: "TransactionList GET completed successfully"});
    return NextResponse.json(reportData);

  } catch (error) {
    // Report any fetch errors
    logger.error(`TransactionList GET exception: ${error}`);
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
  "create_by",
  "create_date",
  "credit",
  "cust_msg",
  "debit",
  "dept_name",             // Default if location tracking enabled
  "doc_num",               // Default
  "due_date",
  "extra_doc_num",
  "inv_date",
  "is_adj",
  "is_ap_paid",
  "is_ar_paid",
  "is_cleared",
  "is_no_post",            // Default
  "last_mod_by",
  "last_mod_date",
  "memo",                  // Default
  "name",                  // Default
  "olb_status",
  "other_account",         // Default
  "pmt_mthd",
  "printed",
  "sales_cust1",
  "sales_cust2",
  "sales_cust3",
  "ship_via",
  "term_name",
  "tracking_num",
  "tx_date",               // Default
  "txn_type",              // Default
]);

// Valid SORT_ORDER values
const SORT_ORDERS: Set<string> = new Set<string>([
  "ascend",
  "descend",
]);

// Valid Transaction Types
const TRANSACTION_TYPES: Set<string> = new Set<string>([
  "Bill",
  "BillableCharge",
  "BillPaymentCheck",
  "BillPaymentCreditCard",
  "CashPurchase",
  "Charge",
  "Check",
  "Credit",
  "CreditCardCharge",
  "CreditCardCredit",
  "CreditMemo",
  "CreditRefund",
  "Deposit",
  "Estimate",
  "Expenditure",
  "GlobalTaxAdjustment",
  "GlobalTaxPayment",
  "InventoryQuantityAdjustment",
  "Invoice",
  "JournalEntry",
  "PurchaseOrder",
  "ReceivePayment",
  "SalesReceipt",
  "ServiceTaxDefer",
  "ServiceTaxGrossAdjustment",
  "ServiceTaxPartialUtilisation",
  "ServiceTaxRefund",
  "ServiceTaxReversal",
  "Statement",
  "TimeActivity",
  "Transfer",
  "VendorCredit",


])

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

// Validate the columns parameter (if provided) contains only supported column names.
// Returns commas separated list of invalid column names, or null if all are valid
function areValidTransactionTypes(transactionTypes: string | null): string | null {
  if (!transactionTypes) {
    return null; // No columns specified, use defaults
  }
  const invalidTransactionTypes: string[] = [];
  const typeList = transactionTypes.split(",");
  for (const type of typeList) {
    if (!TRANSACTION_TYPES.has(type.trim())) {
      invalidTransactionTypes.push(type.trim());
    }
  }
  return invalidTransactionTypes.length > 0 ? invalidTransactionTypes.join(", ") : null;
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

