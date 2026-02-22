/**
 * Server side route to fetch information for a TransactionList from QBO,
 * including authentication if necessary.  The returned value will be
 * the JSON response from QBO, as filtered by the request parameters.
 */

// External Imports ----------------------------------------------------------

import { fetchApiInfo } from "@repo/qbo-api/AuthFunctions";
import { serverLogger as logger } from "@repo/shared-utils";
import { type NextRequest, NextResponse } from "next/server";

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

//const isCi = process.env.CI === "true" || false; // For CI environments

export async function GET(request: NextRequest): Promise<NextResponse> {

/*
  if (isCi) {
    logger.error({
      context: "TransactionList.route",
      message: "TransactionList called in CI mode"
    });
    return NextResponse.json(
      {error: "TransactionList called in CI mode"},
      {status: 500}
    );
  }
*/
  logger.trace("TransactionList GET starting");

  try {

    // Extract query parameters
    const requestUrl = new URL(request.url);
    logger.info({
      context: "TransactionList.route",
      inboundUrl: requestUrl.toString(),
    });
    const params = requestUrl.searchParams;
    // Start date (YYYY-MM-DD)
    const startDate = params.get("startDate");
    // End date (YYYY-MM-DD)
    const endDate = params.get("endDate");
    // Comma-delimited list of columns to include (Report Defaults if not present)
    const columns = params.get("columns") || null;
    //  "tx_date,txn_type,doc_num,name,memo,account_name,subt_nat_amount";
    // Comma-delimited list of columns to sort by (account_name,tx_date if not present)
    const sortBy = params.get("sortBy") || "account_name,tx_date";
    // Sort order (ascend if not present)
    const sortOrder = params.get("sortOrder") || "ascend";
    // Comma-delimited list of columns to include (all if not present)
    const transaction_type = params.get("transaction_type") || null;
  //    "Bill,BillPaymentCheck,JournalEntry,Expenditure,Pledge,Payment,CreditCardPayment";

    // Validate required parameters
    if (!startDate || !endDate) {
      logger.warn({
        context: "TransactionList.route",
        message: "TransactionList GET missing required startDate and/or endDate parameters"
      });
      return NextResponse.json(
        {error: "Missing required parameters: startDate and endDate"},
        {status: 400}
      );
    }
    if (!isValidYMD(startDate)) {
      logger.warn({
        context: "TransactionList.route",
        message: `Invalid startDate format for ${startDate}`,
      });
      return NextResponse.json(
        {error: "startDate must be in YYYY-MM-DD format"},
        {status: 400}
      );
    }
    if (!isValidYMD(endDate)) {
      logger.warn({
        context: "TransactionList.route",
        message: `Invalid endDate format for ${endDate}`,
      });
      return NextResponse.json(
        {error: "endDate must be in YYYY-MM-DD format"},
        {status: 400}
      );
    }
    if (endDate < startDate) {
      logger.warn({
        context: "TransactionList.route",
        message: "endDate must not be before startDate",
        endDate,
        startDate,
      });
      return NextResponse.json(
        {error: "endDate must be on or after startDate"},
        {status: 400}
      );
    }

    // Validate optional parameters
    const invalidCols = areValidColumns(columns);
    if (invalidCols) {
      logger.warn({
        context: "TransactionList.route",
        message: "Invalid column name(s) specified",
        invalidCols,
      });
      return NextResponse.json(
        {error: `Invalid column names: ${invalidCols}`},
        {status: 400}
      );
    }
    const invalidTypes = areValidTransactionTypes(transaction_type);
    if (invalidTypes) {
      logger.warn({
        context: "TransactionList.route",
        message: "Invalid transaction type(s) specified",
        invalidTypes,
      });
      return NextResponse.json(
        {error: `Invalid transaction types: ${invalidTypes}`},
        {status: 400}
      );
    }
    const invalidSortBy = areValidColumns(sortBy);
    if (invalidSortBy) {
      logger.warn({
        context: "TransactionList.route",
        message: "Invalid sortBy column name(s) specified",
        invalidSortBy,
      });
      return NextResponse.json(
        {error: `Invalid sortBy column names: ${invalidSortBy}`},
        {status: 400}
      );
    }
    if (!isValidSortOrder(sortOrder)) {
      logger.warn({
        context: "TransactionList.route",
        message: "Invalid sortOrder specified",
        sortOrder,
      });
      return NextResponse.json(
        {error: `Invalid sortOrder: must be one of ${Array.from(SORT_ORDERS).join(", ")}`},
        {status: 400}
      );
    }

    // Fetch the authentication credentials
    const apiInfo = await fetchApiInfo(API_TIMEOUT);
    if (!apiInfo) {
      logger.error({
        context: "TransactionList.route",
        message: "Unable to fetch API info",
      });
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
    if (transaction_type) {
      reportUrl.searchParams.set("transaction_type", transaction_type);
    }
    logger.info({
      context: "TransactionList.route",
      outboundUrl: reportUrl.toString(),
    });

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
      logger.error({
          context: "TransactionList.route",
          errorText,
        });
      return NextResponse.json(
        {error: `QBO API error: ${response.status} - ${errorText}`},
        {status: response.status}
      );
    }

    // Return the report data to the caller
    const reportData = await response.json();
    logger.info({
      context: "TransactionList.route",
      message: "Report data retrieved successfully",
      length: reportData.length,
    });
    return NextResponse.json(reportData);

  } catch (error) {
    // Report any fetch errors
    logger.error({
      context: "TransactionList.route",
      message: "Error on data retrieval",
      error,
    });
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
  "subt_nat_amount",
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
  /*
    "CreditCardPayment",
    "Expenditure",
    "Payment",
    "Pledge",
    "ReceivePayment",
   */
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

