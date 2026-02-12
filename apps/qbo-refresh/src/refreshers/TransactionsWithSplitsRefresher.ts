/**
 * Refresh Transactions With Splits from QuickBooks Online.
 */

// External Modules ----------------------------------------------------------

import { fetchTransactionsWithSplits } from "@repo/qbo-api/TransactionsWithSplitsFunctions";
import { QboApiInfo } from "@repo/qbo-api/types/Types";
//import { dbQbo, TransactionWithSplits } from "@repo/qbo-db/*";
import { serverLogger as logger } from "@repo/shared-utils/*";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export async function refreshTransactionsWithSplits(
  apiInfo: QboApiInfo,
  startDate: string,
  endDate: string,
): Promise<void> {

  const currentTime = new Date().toISOString();

  // Fetch all transactions with splits from QBO API
  const reportData = await fetchTransactionsWithSplits(apiInfo, {startDate, endDate});
  logger.info({
    context: "TransactionsWithSplitsRefresher.refreshTransactionsWithSplits.fetched",
    headers: reportData.headers,
    totalRows: reportData.rows.length,
  });

  // Filter out empty or invalid rows
  // TODO - add filtering logic here

  // Add the transactions with splits to the database
  for (let i = 0; i < reportData.rows.length; i++) {
    console.info(`${i + 1}:` + JSON.stringify(reportData.rows[i]));
    // TODO - add to database
  }

}
