/**
 * Base page for Customers.
 */

// External Imports ----------------------------------------------------------

import { dbQbo } from "@repo/qbo-db/dist";

// Internal Imports ----------------------------------------------------------

import { CustomersTable } from "@/components/customers/CustomersTable";

// Public Objects ------------------------------------------------------------

export default async function CustomersPage() {

  const allCustomers = await dbQbo.customer.findMany({
/*
    include: {
      invoices: true,
    },
*/
    orderBy: [
      { name: "asc" },
    ],
  });

  return (
    <CustomersTable
      allCustomers={allCustomers}
    />
  );

}
