/**
 * Base page for Accounts.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { AccountsTable } from "@/components/accounts/AccountsTable";
import { dbBill } from "@repo/bill-db/dist";

// Public Objects ------------------------------------------------------------

export default async function AccountsPage() {

  const allAccounts = await dbBill.account.findMany({
    include: {
      billClassifications: {
        include: {
          bill: true,
        },
      },
    },
    orderBy: [
      { accountNumber: "asc" },
      { name: "asc" },
    ],
  });

  return (
    <AccountsTable
      allAccounts={allAccounts}
    />
  );

}
