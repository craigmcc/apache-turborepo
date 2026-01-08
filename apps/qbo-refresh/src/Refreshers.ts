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

const MAX_RESULTS = 100; // Maximum results per QBO API request

export async function refreshAccounts(apiInfo: QboApiInfo): Promise<void> {

  console.log("Fetching accounts...");

  let count = 0;
  let startPosition = 1;

  while (true) {

    const qboAccounts = await fetchAccounts(apiInfo, {
      startPosition: startPosition,
      maxResults: MAX_RESULTS,
    });
    console.log("Fetched accounts: ", JSON.stringify(qboAccounts, null, 2));

    for (const qboAccount of qboAccounts) {
      const account = createAccount(qboAccount);
      // TODO: Store in local database
      count++;
    }

    if (qboAccounts.length < MAX_RESULTS) {
      break;
    } else {
      startPosition += MAX_RESULTS;
    }

  }

  console.log("Accounts refreshed: ", count);

}
