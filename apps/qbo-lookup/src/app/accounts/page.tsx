/**
 * Base page for Accounts.
 */

// External Imports ----------------------------------------------------------

import { dbQbo } from "@repo/qbo-db/dist";

// Internal Imports ----------------------------------------------------------

import { AccountsTable } from "@/components/accounts/AccountsTable";

// Public Objects ------------------------------------------------------------

export default async function AccountsPage() {

  const allAccounts = await dbQbo.account.findMany({
    include: {
      childAccounts: true,
      parentAccount: true,
    },
    orderBy: [
      { name: "asc" },
    ],
  });

  return (
    <AccountsTable
      allAccounts={allAccounts}
    />
  );

}
