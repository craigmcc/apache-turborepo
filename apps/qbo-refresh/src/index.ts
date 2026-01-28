/**
 * Application that refreshes the data in the QBO database from the QBO API.
 */

// External Modules ----------------------------------------------------------

import { exit } from "node:process";
import { fetchApiInfo } from "@repo/qbo-api/AuthActions";
import { serverLogger as logger } from "@repo/shared-utils/*";

// Internal Modules -----------------------------------------------------------

import { refreshAccounts } from "./refreshers/AccountsRefresher";
import { refreshJournalEntries } from "./refreshers/JournalEntryRefreshers";

// Private Objects ------------------------------------------------------------

// Timeout for API requests (in milliseconds) must allow sufficient time
// for a user to manually authenticate if necessary.
const API_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export async function main() {

  const apiInfo = await fetchApiInfo(API_TIMEOUT);
  logger.info({
    context: "qbo-refresh.started",
  });
  await refreshAccounts(apiInfo);
  await refreshJournalEntries(apiInfo);
  logger.info({
    context: "qbo-refresh.finished",
  });

}

// Main Program ----------------------------------------------------------------

main()
  .then(() => {
    exit(0);
  })
/*
  .catch((error) => {
    logger.error({
      context: "qbo-refresh.error",
      error,
    })
    exit(1);
  });
*/
