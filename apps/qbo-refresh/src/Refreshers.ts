/**
 * Functions to return the entire contents of specific models
 * via the QBO API and store them in a local database.
 */

// External Modules ----------------------------------------------------------

import {
  fetchAccounts
} from "@repo/qbo-api/AccountActions";
import { QboApiInfo } from "@repo/qbo-api/types/Types";

// Internal Modules ----------------------------------------------------------

import {
  createAccount
} from "./Creators";

// Public Objects ------------------------------------------------------------

export async function refreshAccounts(apiInfo: QboApiInfo): Promise<void> {

  console.log("Fetching accounts...");

  const qboAccounts = await fetchAccounts(apiInfo);

  console.log("Fetched accounts: ", JSON.stringify(qboAccounts, null, 2));
  for (const qboAccount of qboAccounts) {
    const account = createAccount(qboAccount);
    // TODO: Store in local database
  }

  console.log("Accounts refreshed: ", qboAccounts.length);

}
