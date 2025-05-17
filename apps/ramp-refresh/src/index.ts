/**
 * @repo/ramp-refresh
 *
 * Application that refreshes the data in the Ramp database from the Ramp API.
 */


// External Modules ----------------------------------------------------------

// Internal Modules -----------------------------------------------------------

import {
  refreshAccessToken,
  refreshDepartments,
  refreshUsers,
} from "./Refreshers.js";

// Private Objects ------------------------------------------------------------

async function main() {

  console.log("Ramp Refresh started at ", new Date().toLocaleString());
  const accessToken = await refreshAccessToken();
  await refreshDepartments(accessToken);
  await refreshUsers(accessToken);

}

// Main Program ----------------------------------------------------------------

main()
  .then(() => {
    console.log("Ramp Refresh finished at ", new Date().toLocaleString());
  })
  .catch((error) => {
    console.error("Error in Ramp Refresh:", error);
  });
