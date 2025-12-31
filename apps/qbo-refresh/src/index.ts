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

export async function main() {

  const apiInfo = await fetchApiInfo();
  console.log("QBO Refresh started at ", new Date().toLocaleString());
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
