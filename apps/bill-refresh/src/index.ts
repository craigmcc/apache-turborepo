/**
 * Application that refreshes the data in the Bill database from the Bill API.
 */

// External Modules ----------------------------------------------------------

import { exit } from "node:process";

// Internal Modules -----------------------------------------------------------

import {
  refreshAccounts,
  refreshBills,
  refreshSessionIdV2,
  refreshSessionIdV3,
  refreshUsers,
  refreshVendors,
  refreshVendorCredits,
} from "./Refreshers";

// Private Objects ------------------------------------------------------------

export async function main() {

  console.log("Bill Refresh started at ", new Date().toLocaleString());
  const sessionIdV2 = await refreshSessionIdV2();
  const sessionId = await refreshSessionIdV3();
  await refreshAccounts(sessionIdV2);
  await refreshUsers(sessionId);
  await refreshVendors(sessionId);
  await refreshBills(sessionId);
  await refreshVendorCredits(sessionId);
  console.log("Done with refreshing data");

}

// Main Program ----------------------------------------------------------------

main()
  .then(() => {
    console.log("Bill Refresh finished at ", new Date().toLocaleString());
    exit(0);
  })
  .catch((error) => {
    console.error("Error in Bill Refresh:", error);
    exit(1);
  });
