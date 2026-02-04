/**
 * Server side route to fetch information for a TransactionListWithSplits
 * from QBO, including authentication if necessary.  The returned value will be
 * the JSON response from QBO, as filtered by the request parameters.
 */

// External Imports ----------------------------------------------------------

import { fetchApiInfo } from "@repo/qbo-api/AuthFunctions";
import { serverLogger as logger } from "@repo/shared-utils/*";
import { type NextRequest, NextResponse } from "next/server";

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

//const isCi = process.env.CI === "true" || false; // For CI environments

export async function GET(request: NextRequest): Promise<NextResponse> {

/*
  if (isCi) {
    logger.error({
      context: "TransactionListWithSplits.route",
      message: "TransactionListWithSplits called in CI mode"
    });
    return NextResponse.json(
      {error: "TransactionListWithSplits called in CI mode"},
      {status: 500}
    );
  }
*/
  logger.trace("TransactionListWithSplits GET starting");

  try {

    // Extract query parameters
    const requestUrl = new URL(request.url);
    logger.info({
      context: "TransactionListWithSplits.route",
      inboundUrl: requestUrl.toString(),
    });
    const params = requestUrl.searchParams;

    // REQUIRED PARAMETERS
    // End date (YYYY-MM-DD)
    const end_date = params.get("end_date");
    // Start date (YYYY-MM-DD)
    const start_date = params.get("start_date");

    // OPTIONAL PARAMETERS
    // Comma-delimited list of columns to include (Report Defaults if not present)
    const columns = params.get("columns") || /*null;*/
      "tx_date,txn_type,doc_num,is_no_post,name,memo,account_name,nat_amount";
    // Filter by the transaction number to render for this report
    const docnum = params.get("docnum") || null;
    // Group by (none if not present)
    const group_by = params.get("group_by") || //null;
      "Account";
    // Filter by the payment method to render for this report
    const payment_method = params.get("payment_method") || null;
    // Comma-delimited list of columns to sort by (account_name,tx_date if not present)
    const sort_by = params.get("sort_by") || null;
    // Sort order (ascend if not present)
    const sort_order = params.get("sort_order") || null;
    // Source account type (all if not present)
    const source_account_type = params.get("source_account_type") || null;
    // Comma-delimited list of columns to include (all if not present)
    const transaction_type = params.get("transaction_type") || null;

    // Validate required parameters

    if (!start_date || !end_date) {
      logger.warn({
        context: "TransactionListWithSplits.route",
        message: "TransactionListWithSplits GET missing required startDate and/or endDate parameters"
      });
      return NextResponse.json(
        {error: "Missing required parameters: startDate and endDate"},
        {status: 400}
      );
    }

    if (!isValidYMD(start_date)) {
      logger.warn({
        context: "TransactionListWithSplits.route",
        message: `Invalid startDate format for ${start_date}`,
      });
      return NextResponse.json(
        {error: "startDate must be in YYYY-MM-DD format"},
        {status: 400}
      );
    }

    if (!isValidYMD(end_date)) {
      logger.warn({
        context: "TransactionListWithSplits.route",
        message: `Invalid endDate format for ${end_date}`,
      });
      return NextResponse.json(
        {error: "endDate must be in YYYY-MM-DD format"},
        {status: 400}
      );
    }

    if (end_date < start_date) {
      logger.warn({
        context: "TransactionListWithSplits.route",
        message: "endDate must not be before startDate",
        endDate: end_date,
        startDate: start_date,
      });
      return NextResponse.json(
        {error: "endDate must be on or after startDate"},
        {status: 400}
      );
    }

    // Validate optional parameters

    const invalidColumns = areValidColumns(columns);
    if (invalidColumns) {
      logger.warn({
        context: "TransactionListWithSplits.route",
        message: "Invalid column name(s) specified",
        invalidCols: invalidColumns,
      });
      return NextResponse.json(
        {error: `Invalid column names: ${invalidColumns}`},
        {status: 400}
      );
    }

    if (!isValidGroupBy(group_by)) {
      logger.warn({
        context: "TransactionListWithSplits.route",
        message: "Invalid group_by specified",
        group_by: group_by,
      });
      return NextResponse.json(
        {error: `Invalid sortOrder: must be one of ${Array.from(SORT_ORDERS).join(", ")}`},
        {status: 400}
      );
    }

    const invalidPaymentMethods = areValidPaymentMethods(payment_method);
    if (invalidPaymentMethods) {
      logger.warn({
        context: "TransactionListWithSplits.route",
        message: "Invalid payment methods(s) specified",
        invalidPaymentMethods,
      });
      return NextResponse.json(
        {error: `Invalid payment methods: ${invalidPaymentMethods}`},
        {status: 400}
      );
    }

    const invalidSortBy = areValidColumns(sort_by);
    if (invalidSortBy) {
      logger.warn({
        context: "TransactionListWithSplits.route",
        message: "Invalid sortBy column name(s) specified",
        invalidSortBy,
      });
      return NextResponse.json(
        {error: `Invalid sortBy column names: ${invalidSortBy}`},
        {status: 400}
      );
    }

    if (!isValidSortOrder(sort_order)) {
      logger.warn({
        context: "TransactionListWithSplits.route",
        message: "Invalid sortOrder specified",
        sortOrder: sort_order,
      });
      return NextResponse.json(
        {error: `Invalid sortOrder: must be one of ${Array.from(SORT_ORDERS).join(", ")}`},
        {status: 400}
      );
    }

    const invalidSourceAccountTypes = areValidSourceAccountTypes(source_account_type);
    if (invalidSourceAccountTypes) {
      logger.warn({
        context: "TransactionListWithSplits.route",
        message: "Invalid source account type(s) specified",
        invalidSourceAccountTypes,
      });
      return NextResponse.json(
        {error: `Invalid source account types: ${invalidSourceAccountTypes}`},
        {status: 400}
      );
    }

    const invalidTransactionTypes = areValidTransactionTypes(transaction_type);
    if (invalidTransactionTypes) {
      logger.warn({
        context: "TransactionListWithSplits.route",
        message: "Invalid transaction type(s) specified",
        invalidTypes: invalidTransactionTypes,
      });
      return NextResponse.json(
        {error: `Invalid transaction types: ${invalidTransactionTypes}`},
        {status: 400}
      );
    }

    // Fetch the authentication credentials
    const apiInfo = await fetchApiInfo(API_TIMEOUT);
    if (!apiInfo) {
      logger.error({
        context: "TransactionListWithSplits.route",
        message: "Unable to fetch API info",
      });
      return NextResponse.json(
        {error: "Unable to fetch API info"},
        {status: 500}
      );
    }

    // Construct the report URL
    const reportUrl = new URL(`${apiInfo.baseUrl}/v3/company/${apiInfo.realmId}/reports/TransactionListWithSplits`);
    // REQUIRED PARAMETERS
    reportUrl.searchParams.set("end_date", end_date);
    reportUrl.searchParams.set("start_date", start_date);
    // OPTIONAL PARAMETERS
    if (columns) {
      reportUrl.searchParams.set("columns", columns);
    }
    if (docnum) {
      reportUrl.searchParams.set("docnum", docnum);
    }
    if (group_by) {
      reportUrl.searchParams.set("group_by", group_by);
    }
    if (payment_method) {
      reportUrl.searchParams.set("payment_method", payment_method);
    }
    if (sort_by) {
      reportUrl.searchParams.set("sort_by", sort_by);
    }
    if (sort_order) {
      reportUrl.searchParams.set("sort_order", sort_order);
    }
    if (source_account_type) {
      reportUrl.searchParams.set("source_account_type", source_account_type);
    }
    if (transaction_type) {
      reportUrl.searchParams.set("transaction_type", transaction_type);
    }

    logger.info({
      context: "TransactionListWithSplits.route",
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
        context: "TransactionListWithSplits.route",
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
      context: "TransactionListWithSplits.route",
      message: "Report data retrieved successfully",
      length: reportData.length,
    });
    return NextResponse.json(reportData);

  } catch (error) {

    // Report any fetch errors
    logger.error({
      context: "TransactionListWithSplits.route",
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
// (Those marked "Default" are included if no columns are specified.?)
const COLUMN_NAMES: Set<string> = new Set<string>([
  "account_name",          // Default
  "amount",
  "create_by",
  "create_date",
  "credit_amt",
  "cust_name",
  "debt_amt",
  "dept_name",
  "doc_num",               // Default
  "emp_name",
  "is_adj",
  "is_billable",
  "is_cleared",
  "is_no_post",            // Default
  "item_name",
  "last_mod_by",
  "last_mod_date",
  "memo",
  "name",
  "nat_amount",
  "nat_open_bal",
  "olb_status",
  "pmt_mthd",
  "quantity",
  "rate",
  "tax_type",
  "tx_date",               // Default
  "txn_type",              // Default
  "vend_name",
/*
  "credit",
  "cust_msg",
  "debit",
  "dept_name",             // Default if location tracking enabled
  "due_date",
  "extra_doc_num",
  "inv_date",
  "is_ap_paid",
  "is_ar_paid",
  "memo",                  // Default
  "name",                  // Default
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
*/
]);

// Valid GROUP_BY values
const GROUP_BYS: Set<string> = new Set<string>([
  "Account",
  "Name",
  "TransactionType",
]);

// Valid PAYMENT_METHOD values
const PAYMENT_METHODS: Set<string> = new Set<string>([
  "AmericanExpress",
  "Cash",
  "Check",
  "Diners Club",
  "Discover",
  "MasterCard",
  "Visa",
]);

// Valid SORT_ORDER values
const SORT_ORDERS: Set<string> = new Set<string>([
  "ascend",
  "descend",
]);

// Valid SOURCE_ACCOUNT_TYPE values
const SOURCE_ACCOUNT_TYPES: Set<string> = new Set<string>([
  "AccountsPayable",
  "AccountsReceivable",
  "Bank",
  "CostOfGoodsSold",
  "CreditCard",
  "Expense",
  "FixedAsset",
  "Income",
  "LongTermLiability",
  "NonPosting",
  "OtherAsset",
  "OtherCurrentAsset",
  "OtherCurrentLiability",
  "OtherExpense",
  "OtherIncome",
]);

// Valid TRANSACTION_TYPE values
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

// Validate the payment_method parameter (if provided) contains only supported values.
// Returns commas separated list of invalid values, or null if all are valid
function areValidPaymentMethods(paymentMethods: string | null): string | null {
  if (!paymentMethods) {
    return null; // No values specified, use defaults
  }
  const invalidPaymentMethods: string[] = [];
  const typeList = paymentMethods.split(",");
  for (const type of typeList) {
    if (!PAYMENT_METHODS.has(type.trim())) {
      invalidPaymentMethods.push(type.trim());
    }
  }
  return invalidPaymentMethods.length > 0 ? invalidPaymentMethods.join(", ") : null;
}

// Validate the source_account_type parameter (if provided) contains only supported values.
// Returns commas separated list of invalid types names, or null if all are valid
function areValidSourceAccountTypes(sourceAccountTypes: string | null): string | null {
  if (!sourceAccountTypes) {
    return null; // No values specified, use defaults
  }
  const invalidSourceAccountTypes: string[] = [];
  const typeList = sourceAccountTypes.split(",");
  for (const type of typeList) {
    if (!SOURCE_ACCOUNT_TYPES.has(type.trim())) {
      invalidSourceAccountTypes.push(type.trim());
    }
  }
  return invalidSourceAccountTypes.length > 0 ? invalidSourceAccountTypes.join(", ") : null;
}

// Validate the transaction_type parameter (if provided) contains only supported column names.
// Returns commas separated list of invalid types, or null if all are valid
function areValidTransactionTypes(transaction_type: string | null): string | null {
  if (!transaction_type) {
    return null; // No values specified, use defaults
  }
  const invalidTransactionTypes: string[] = [];
  const typeList = transaction_type.split(",");
  for (const type of typeList) {
    if (!TRANSACTION_TYPES.has(type.trim())) {
      invalidTransactionTypes.push(type.trim());
    }
  }
  return invalidTransactionTypes.length > 0 ? invalidTransactionTypes.join(", ") : null;
}

// Validate the GROUP_BY parameter
function isValidGroupBy(group_by: string | null): boolean {
  if (!group_by) {
    return true; // No group by specified, use defaults
  }
  return GROUP_BYS.has(group_by);
}

// Validate the SORT_ORDER parameter
function isValidSortOrder(sort_order: string | null): boolean {
  if (!sort_order) {
    return true; // No sort order specified, use defaults
  }
  return SORT_ORDERS.has(sort_order);
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

