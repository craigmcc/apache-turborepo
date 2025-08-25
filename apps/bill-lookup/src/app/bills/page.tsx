/**
 * Base page for Bills.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { BillsTable } from "@/components/bills/BillsTable";
import { dbBill } from "@repo/bill-db/dist";

// Public Objects ------------------------------------------------------------

export default async function BillsPage() {

  const allBills = await dbBill.bill.findMany({
    include: {
      approvers: {
        include: {
          user: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
      classifications: {
        include: {
          account: true,
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
      vendor: true,
    },
    orderBy: [
      { vendorName: "asc" },
      { invoiceDate: "asc" },
    ],
  });

  return (
    <BillsTable
      allBills={allBills}
    />
  );

}
