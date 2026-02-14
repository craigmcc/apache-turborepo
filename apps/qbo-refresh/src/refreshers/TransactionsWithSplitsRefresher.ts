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

  // Fetch all transactions with splits from QBO API
  const parsedReport =
    await fetchTransactionsWithSplits(apiInfo, {startDate, endDate});
  logger.info({
    context: "TransactionsWithSplitsRefresher.refreshTransactionsWithSplits.fetched",
    startDate,
    endDate,
    totalColumns: parsedReport.columns.length,
    totalRows: parsedReport.rows.length,
  });

  // Document the first stuff for debugging
  console.info("Header:" + JSON.stringify(parsedReport.header));
  for (let i = 0; i < parsedReport.columns.length; i++) {
    console.info(`Column ${i + 1}:` + JSON.stringify(parsedReport.columns[i]));
  }
  for (let i = 0; i < 400; i++) {
    console.info(`Row    ${i + 1}:` + JSON.stringify(parsedReport.rows[i]));
  }

  // TODO: Add the transactions with splits to the database

}
