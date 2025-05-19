/**
 * @repo/ramp-refresh
 *
 * Application that refreshes the data in the Ramp database from the Ramp API.
 */


// External Modules ----------------------------------------------------------

// Internal Modules -----------------------------------------------------------

import {
  refreshAccessToken,
  refreshCards,
  refreshDepartments,
  refreshLimits,
//  refreshTransactions,
  refreshUsers,
} from "./Refreshers.js";

// Private Objects ------------------------------------------------------------

async function main() {

  console.log("Ramp Refresh started at ", new Date().toLocaleString());
  const accessToken = await refreshAccessToken();
  await refreshDepartments(accessToken);
  await refreshUsers(accessToken);
  await refreshCards(accessToken);
  await refreshLimits(accessToken);
//  await refreshTransactions(accessToken);

}

// Main Program ----------------------------------------------------------------

main()
  .then(() => {
    console.log("Ramp Refresh finished at ", new Date().toLocaleString());
  })
  .catch((error) => {
    console.error("Error in Ramp Refresh:", error);
  });
