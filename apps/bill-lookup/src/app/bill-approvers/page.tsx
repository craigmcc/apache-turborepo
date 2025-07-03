/**
 * Base page for Bill Approvers.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { BillApproversTable } from "@/components/bill-approvers/BillApproversTable";
import { dbBill } from "@repo/bill-db/dist";

// Public Objects ------------------------------------------------------------

export default async function BillApproversPage() {

  const allBillApprovers = await dbBill.billApprover.findMany({
    include: {
      bill: {
        include: {
          classifications: {
            include: {
              account: true,
            },
          },
/*
          lineItems: {
            include: {
              classifications: {
                include: {
                  account: true,
                },
              },
            },
          },
*/
          vendor: true,
        },
      },
      user: true,
    },
    orderBy: [
      { bill: { vendorName: "asc" } },
      { bill: { invoiceDate: "asc" } },
    ],
  });

  return (
    <BillApproversTable
      allBillApprovers={allBillApprovers}
    />
  );

}
