/**
 * @repo/ramp-refresh
 *
 * Application that refreshes the data in the Ramp database from the Ramp API.
 */


// External Modules ----------------------------------------------------------

import { exit } from "node:process";

// Internal Modules -----------------------------------------------------------

import {
  eraseViolations,
  refreshAccessToken,
  refreshAccountingGLAccounts,
  refreshCards,
  refreshDepartments,
  refreshLimits,
  refreshSpendPrograms,
  refreshTransactions,
  refreshUsers,
} from "./Refreshers";

// Private Objects ------------------------------------------------------------

export async function main() {

  console.log("Ramp Refresh started at ", new Date().toLocaleString());
  const result = await refreshAccessToken();
  const accessToken = result.access_token;
  console.log("Requested Scopes: ", process.env.RAMP_PROD_API_SCOPE);
  console.log("Returned Scopes:  ", result.scope);
//  const scopes = result.scope.split(" ");
  await eraseViolations();
  await refreshAccountingGLAccounts(accessToken);
  await refreshDepartments(accessToken);
  await refreshUsers(accessToken);
  await refreshCards(accessToken);
  await refreshSpendPrograms(accessToken);
  await refreshLimits(accessToken);
  await refreshTransactions(accessToken);
  console.log("Done with refreshing data")

}

// Main Program ----------------------------------------------------------------

main()
  .then(() => {
    console.log("Ramp Refresh finished at ", new Date().toLocaleString());
    exit(0);
  })
  .catch((error) => {
    console.error("Error in Ramp Refresh:", JSON.stringify(error, null, 2));
    exit(1);
  });
