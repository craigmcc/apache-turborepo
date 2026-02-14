/**
 * Application that refreshes the data in the QBO database from the QBO API.
 *
 * Command Line Options:
 *   --endDate YYYY-MM-DD    End date for included journal entries (required)
 *   --startDate YYYY-MM-DD  Start date for included journal entries (required)
 */

// External Modules ----------------------------------------------------------

import { exit } from "node:process";
import { fetchApiInfo } from "@repo/qbo-api/AuthFunctions";
import { serverLogger as logger } from "@repo/shared-utils/*";

// Internal Modules -----------------------------------------------------------

import { refreshAccounts } from "./refreshers/AccountsRefresher";
import { refreshJournalEntries } from "./refreshers/JournalEntryRefreshers";
import {parseArgs} from "node:util";
import {refreshTransactionsWithSplits} from "./refreshers/TransactionsWithSplitsRefresher";

// Private Objects ------------------------------------------------------------

// Timeout for API requests (in milliseconds) must allow sufficient time
// for a user to manually authenticate if necessary.
const API_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export async function main() {

  // Process command line arguments
/*
  const args = parseArgs({
    options: {
      endDate: {
        type: "string",
      },
      startDate: {
        type: "string",
      },
    },
    strict: true,
  });
  if (!args.values.endDate) {
    throw new Error("endDate argument is required");
  }
  if (!args.values.startDate) {
    throw new Error("startDate argument is required");
  }
  if (args.values.endDate < args.values.startDate) {
    throw new Error("endDate must be on or after startDate");
  }
  logger.info({
    context: "qbo-refresh.parameters",
    startDate: args.values.startDate,
    endDate: args.values.endDate,
  });
*/

  const apiInfo = await fetchApiInfo(API_TIMEOUT);
  logger.info({
    context: "qbo-refresh.started",
  });
  await refreshAccounts(apiInfo);
  await refreshJournalEntries(apiInfo);
  await refreshTransactionsWithSplits(apiInfo, "2001-01-01", "2999-12-31");
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
