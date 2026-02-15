/**
 * Refresh Transactions With Splits from QuickBooks Online.
 */

// External Modules ----------------------------------------------------------

import { fetchTransactionsWithSplits } from "@repo/qbo-api/TransactionsWithSplitsFunctions";
import { QboApiInfo } from "@repo/qbo-api/types/Types";
import {dbQbo, Transaction } from "@repo/qbo-db/*";
import { serverLogger as logger } from "@repo/shared-utils/*";
//type TransactionCreateArgs = Prisma.TransactionCreateArgs;

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
    header: parsedReport.header,
    columns: parsedReport.columns,
    totalRows: parsedReport.rows.length,
  });

  // Delete existing transactions in the database for the given date range
  const deleteResult = await dbQbo.transaction.deleteMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  logger.info({
    context: "TransactionsWithSplitsRefresher.refreshTransactionsWithSplits.deleted",
    deletedCount: deleteResult.count,
  });

  // Look up existing accounts in the database to validate account IDs and avoid creating duplicates
  const accountMap = new Map<string, string>();
  const accounts = await dbQbo.account.findMany({});
  for (const account of accounts) {
    accountMap.set(account.acctNum!, account.id);
  }

  // Insert new transactions with splits into the database
  for (let index = 0; index < parsedReport.rows.length; index++) {
    const row = parsedReport.rows[index]!;
    const accountId = accountMap.get(row.columns[5]!.value.substring(0, 4));
//    const transaction: TransactionCreateArgs["data"] = {
    const transaction: Transaction = {
      id: BigInt(index), // use row index as ID since report data does not include a unique identifier
      date: stringOrNull(row.columns[0]?.value),
      type: stringOrNull(row.columns[1]?.value),
      documentNumber: stringOrNull(row.columns[2]?.value),
      name: stringOrNull(row.columns[3]?.value),
      memo: stringOrNull(row.columns[4]?.value),
      accountId: accountId ?? null,
      amount: row.columns[6]?.value ? parseFloat(row.columns[6].value) : null,
    };
    const result = await dbQbo.transaction.create({data: transaction});
    if (index < 20) {
      logger.info({
        context: "TransactionsWithSplitsRefresher.refreshTransactionsWithSplits.inserting",
        result,
      });
    }
  }
  logger.info({
    context: "TransactionsWithSplitsRefresher.refreshTransactionsWithSplits.inserted",
    insertedCount: parsedReport.rows.length,
  });

}

// Private Objects -----------------------------------------------------------

function stringOrNull(value: string | undefined): string | null {
  return value === "" ? null : value ?? null;
}
