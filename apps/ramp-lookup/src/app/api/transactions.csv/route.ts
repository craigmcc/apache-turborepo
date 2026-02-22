/**
 * API route to serve transactions data from a CSV file.
 */

// External Imports ----------------------------------------------------------

import { dbRamp } from "@repo/ramp-db/*";
import { isAccountInGroup } from "@repo/shared-utils";
import { NextRequest } from "next/server";

// Internal Imports ----------------------------------------------------------

import {
  formatAccountingDate,
  formatAmount,
  formatCardLastFour,
  formatCardName,
  formatGlAccount,
  formatMerchantName,
  formatTransactionState,
  formatUserName,
} from "@/lib/Formatters";
import { TransactionPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

/**
 * GET /api/transactions.csv?{queryParameters}
 *
 * Query Parameters (all are required):
 * - accountGroup - Name of the account group for which to retrieve transactions
 * - fromDate - Start date for filtering transactions (YYYY-MM-DD)
 * - toDate - End date for filtering transactions (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {

  // Accumulator for errors
  const errors: string[] = [];

  const searchParams = request.nextUrl.searchParams;
  const accountGroup = searchParams.get("accountGroup");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  if (!accountGroup) {
    errors.push("Missing required parameter: accountGroup");
  }
  if (!fromDate) {
    errors.push("Missing required parameter: fromDate");
  }
  if (!toDate) {
    errors.push("Missing required parameter: toDate");
  }

  // If we have errors so far, return them
  if (errors.length > 0) {
    return returnErrors(errors);
  }

  // Select the transactions by date range, and filter by accountGroup
  const transactions = await lookupTransactionsByAccountingDate(fromDate!, toDate!);
  const filteredTransactions = transactions.filter((transaction) =>
    isAccountInGroup(formatGlAccount(transaction), accountGroup!)
  );

  // Return a CSV response containing the filtered transactions
  const rawHeaders = [
    "Accounting Date-Time", "User Name", "Card Name", "Last 4", "Original Amount",
    "Settled Amount", "Merchant", "GL Account", "State"
  ];
  const headers: string[] = [];
  rawHeaders.forEach((header) => { headers.push(enquote(header))})
  return returnData(headers, filteredTransactions, accountGroup!, fromDate!, toDate!);

}

// Private Objects -----------------------------------------------------------

/**
 * Add quotes around the specified value.  If the value has a single quote or
 * double quote inside it, the opposite will be used to avoid needing escapes.
 */
function enquote(value: string) {
  if (value.includes('"')) {
    return "'" + value + "'";
  } else {
    return '"' + value + '"';
  }
}

/**
 * Retrieve all transactions in the specified date range (will be filtered by accountGroup separately).
 */
async function lookupTransactionsByAccountingDate(fromDate: string, toDate: string): Promise<TransactionPlus[]> {

  // Retrieve the transactions, sorted by accounting date
  const transactions = await dbRamp.transaction.findMany({
    include: {
      accounting_field_selections: true,
      card: true,
      card_holder_user: {
        include: {
          department: true,
        },
      },
      line_items: true,
      line_item_accounting_field_selections: true,
    },
    orderBy: [
      { accounting_date: "asc" },
    ],
    where: {
      accounting_date: {
        gte: fromDate + "T00:00:00.000Z",
        lte: toDate + "T23:59:59.999Z",
      },
    },
  });

  // Then sort by GL Account with the accounting date secondary
  transactions.sort((a, b) => {
    const glAccountA = formatGlAccount(a) + "|" + formatAccountingDate(a);
    const glAccountB = formatGlAccount(b) + "|" + formatAccountingDate(b);
    if (glAccountA < glAccountB) {
      return -1;
    } else if (glAccountA > glAccountB) {
      return 1;
    } else {
      return 0;
    }
  });

  // Return the results
  return transactions;

}

/**
 * Return a completed CSV response with the filtered data.
 */
function returnData(
  headers: string[],
  transactions: TransactionPlus[],
  accountGroup: string,
  fromDate: string,
  toDate: string
): Response {
  let csvContent: string = headers.map(header => header).join(",") + "\n";
  for (const transaction of transactions) {
    const row: string[] = [];
    row.push(enquote(formatAccountingDate(transaction)));
    row.push(enquote(formatUserName(transaction.card_holder_user)));
    row.push(enquote(formatCardName(transaction.card)));
    row.push(enquote(formatCardLastFour(transaction.card)));
    row.push(enquote(formatAmount(transaction.original_transaction_amount_amt, transaction.original_transaction_amount_cc)));
    row.push(enquote(formatAmount(transaction.amount_amt, transaction.amount_cc)));
    row.push(enquote(formatMerchantName(transaction)));
    row.push(enquote(formatGlAccount(transaction)));
    row.push(enquote(formatTransactionState(transaction)));
    csvContent += row.join(",") + "\n";
  }
  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="Ramp-${accountGroup}-${fromDate}-${toDate}.csv"`,
      "Content-Type": "text/csv",
    },
  });
}

/**
 * Return the specified errors as a CSV response.
 */
function returnErrors(errors: string[]) {
  const body = "Error\n" + errors.map((error) => enquote(error)).join("\n");
  return new Response(body, {
    status: 400,
    headers: {
      "Content-Type": "text/csv",
    },
  });
}

