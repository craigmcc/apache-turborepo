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
  refreshSpendPrograms,
//  refreshTransactions,
  refreshUsers,
} from "./Refreshers.js";

// Private Objects ------------------------------------------------------------

const LIMITS_READ_SCOPE = "limits:read";
const SPEND_PROGRAMS_READ_SCOPE = "spend_programs:read";

async function main() {

  console.log("Ramp Refresh started at ", new Date().toLocaleString());
  const result = await refreshAccessToken();
  const accessToken = result.access_token;
  const scopes = result.scope.split(" ");
//  console.log("Ramp Refresh access token scope: ", result.scope);
  await refreshDepartments(accessToken);
  await refreshUsers(accessToken);
  await refreshCards(accessToken);
  if (scopes.includes(SPEND_PROGRAMS_READ_SCOPE)) {
    await refreshSpendPrograms(accessToken);
  } else {
    console.log(`Fetching spend programs...skipped, scope '${SPEND_PROGRAMS_READ_SCOPE}' not found`);
  }
  if (scopes.includes(LIMITS_READ_SCOPE)) {
    await refreshLimits(accessToken);
  } else {
    console.log(`Fetching spend programs...skipped, scope '${LIMITS_READ_SCOPE}' not found`);
  }
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
