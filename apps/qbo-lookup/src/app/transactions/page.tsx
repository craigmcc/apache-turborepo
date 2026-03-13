/**
 * Base page for Transactions.
 */

// External Imports ----------------------------------------------------------

import { dbQbo } from "@repo/qbo-db/dist";

// Internal Imports ----------------------------------------------------------

import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { TransactionPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export default async function TransactionsPage() {

  const allTransactions: TransactionPlus[] = await dbQbo.transaction.findMany({
    include: {
      account: true,
    },
    orderBy: [
      { account: { acctNum: "asc" } },
      { date: "asc" },
    ],
  });

  return (
    <TransactionsTable
      allTransactions={allTransactions}
    />
  );

}
