/**
 * Application that refreshes the data in the QBO database from the QBO API.
 */

// External Modules ----------------------------------------------------------

import { exit } from "node:process";
import { fetchApiInfo } from "@repo/qbo-api/AuthActions";

// Internal Modules -----------------------------------------------------------

import {
  refreshAccounts,
} from "./Refreshers";

// Private Objects ------------------------------------------------------------

// Timeout for API requests (in milliseconds) must allow enout time
// for a user to manually authenticate if necessary.
const API_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export async function main() {

  console.log("QBO Refresh started at ", new Date().toLocaleString());
  const apiInfo = await fetchApiInfo(API_TIMEOUT);
  await refreshAccounts(apiInfo);
  console.log("Done with refreshing data");

}

// Main Program ----------------------------------------------------------------

main()
  .then(() => {
    console.log("QBO Refresh finished at ", new Date().toLocaleString());
    exit(0);
  })
  .catch((error) => {
    console.error("Error in QBO Refresh:", error);
    exit(1);
  });
