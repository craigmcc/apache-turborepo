/**
 * Application that refreshes the data in the Bill database from the Bill API.
 */

// External Modules ----------------------------------------------------------

import { exit } from "node:process";

// Internal Modules -----------------------------------------------------------

import {
  refreshBills,
  refreshSessionId,
  refreshUsers,
  refreshVendors,
} from "./Refreshers";

// Private Objects ------------------------------------------------------------

export async function main() {

  console.log("Bill Refresh started at ", new Date().toLocaleString());
  const sessionId = await refreshSessionId();
  await refreshUsers(sessionId);
  await refreshVendors(sessionId);
  await refreshBills(sessionId);
  console.log("Done with refreshing data");

}

// Main Program ----------------------------------------------------------------

main()
  .then(() => {
    console.log("Bill Refresh finished at ", new Date().toLocaleString());
    exit(0);
  })
  .catch((error) => {
    console.error("Error in Bill Refresh:", JSON.stringify(error, null, 2));
    exit(1);
  });
