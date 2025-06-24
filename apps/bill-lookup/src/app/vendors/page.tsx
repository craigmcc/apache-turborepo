/**
 * Base page for Vendors.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { VendorsTable } from "@/components/vendors/VendorsTable";
import { dbBill } from "@repo/bill-db/dist";

// Public Objects ------------------------------------------------------------

export default async function VendorsPage() {

  const allVendors = await dbBill.vendor.findMany({
    include: {
      additionalInfo: true,
      address: true,
      autoPay: true,
      paymentInformation: true,
      virtualCard: true,
    },
    orderBy: [
      { name: "asc" },
    ],
  });

  return (
    <VendorsTable
      allVendors={allVendors}
    />
  );

}
