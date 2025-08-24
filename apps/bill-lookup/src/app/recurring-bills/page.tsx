/**
 * Base page for Recurring Bills.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { RecurringBillsTable } from "@/components/recurring-bills/RecurringBillsTable";
import { dbBill } from "@repo/bill-db/dist";

// Public Objects ------------------------------------------------------------

export default async function RecurringBillsPage() {

  const allBills = await dbBill.recurringBill.findMany({
    include: {
      approvers: {
        include: {
          user: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
      lineItems: {
        include: {
          classifications: {
            include: {
              account: true,
            },
          },
        },
      },
      schedule: true,
      vendor: true,
    },
  });

  return (
    <RecurringBillsTable
      allBills={allBills}
    />
  );

}
