/**
 * Functions to return the entire contents of specific models
 * via the QBO API and store them in a local database.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import {
  fetchAccounts
} from "@repo/qbo-api/AccountActions";
import {
  createAccount
} from "./Creators";

// Public Objects ------------------------------------------------------------

export async function refreshAccounts(accessToken: string): Promise<void> {

  console.log("Fetching accounts...");

  const qboAccounts = await fetchAccounts(accessToken);

  console.log("Fetched accounts: ", JSON.stringify(qboAccounts, null, 2));
  for (const qboAccount of qboAccounts) {
    const account = createAccount(qboAccount);
    // TODO: Store in local database
  }

  console.log("Accounts refreshed: ", qboAccounts.length);

}
