/**
 * Transaction List request and response.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { TransactionList } from "@/components/reports/TransactionList";

// Public Objects ------------------------------------------------------------

export default function TransactionListPage() {
  return (
    <div className="p-4">
      <TransactionList/>
    </div>
  );
}
