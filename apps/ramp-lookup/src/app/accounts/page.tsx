/**
 * Base page for GL accounts.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { AccountsTable } from "@/components/accounts/AccountsTable";
import { dbRamp } from "@repo/ramp-db/dist";

// Public Objects ------------------------------------------------------------

export default async function AccountsPage() {

  const allAccounts = await dbRamp.accountingGLAccount.findMany({
    orderBy: [
      { code: "asc" },
    ],
    where: {
      code: {
        not: null,
      }
    }
  });

  return (
    <AccountsTable allAccounts={allAccounts}/>
  );

}
