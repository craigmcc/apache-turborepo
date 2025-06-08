/**
 * Base page for transactions.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { dbRamp } from "@repo/ramp-db/dist";

// Public Objects ------------------------------------------------------------

export default async function TransactionsPage() {

  const allTransactions = await dbRamp.transaction.findMany({
    include: {
      accounting_field_selections: true,
      card: true,
      card_holder_user: true,
      line_items: true,
      line_item_accounting_field_selections: true,
    },
    orderBy: [
      { accounting_date: "asc" },
    ],
  });

  return (
    <TransactionsTable allTransactions={allTransactions}/>
  );

}
