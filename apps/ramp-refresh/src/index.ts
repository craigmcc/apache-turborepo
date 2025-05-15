/**
 * @repo/ramp-refresh
 *
 * Application that refreshes the data in the Ramp database from the Ramp API.
 */


// External Modules ----------------------------------------------------------

// Internal Modules -----------------------------------------------------------

import { fetchAccessToken } from "@repo/ramp-api/AuthActions";
//import { fetchDepartments} from "@repo/ramp-api/DepartmentActions";
//import { fetchUsers } from "@repo/ramp-api/UserActions";
//import { dbRamp, Department } from "@repo/ramp-db/client";

// Private Objects ------------------------------------------------------------

async function main() {
  console.log("Hello from Ramp Refresh!");
  console.log("Fetching access token...");
  let accessToken = "";
  const accessTokenResponse = await fetchAccessToken();
  if (accessTokenResponse.error) {
    throw accessTokenResponse.error;
  } else if (accessTokenResponse.model) {
    accessToken = accessTokenResponse.model.access_token;
    console.log("Access token fetched successfully.", accessToken);
  }
//  const departmentsResponse = await fetchDepartments(accessToken);
//  const departments = await dbRamp.department.findMany();
}

// Main Program ----------------------------------------------------------------

main()
  .then(() => {
    console.log("Ramp Refresh completed successfully.");
  })
  .catch((error) => {
    console.error("Error in Ramp Refresh:", error);
  });
