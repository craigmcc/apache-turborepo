/**
 * Functions to return the entire contents of specific models
 * via the Ramp API.
 */

// External Modules ----------------------------------------------------------

// Internal Modules -----------------------------------------------------------

import { fetchAccessToken } from "@repo/ramp-api/AuthActions";
import { fetchDepartments } from "@repo/ramp-api/DepartmentActions";
/*
import {
  RampDepartment
} from "@repo/ramp-api/Models";
*/
import {
  dbRamp,
  Department
} from "@repo/ramp-db/client";

// Public Objects ------------------------------------------------------------

export async function refreshAccessToken(): Promise<string> {
  console.log("Fetching access token...");
  const accessTokenResponse = await fetchAccessToken();
  if (accessTokenResponse.error) {
    throw accessTokenResponse.error;
  }
  return accessTokenResponse.model!.access_token;
}

export async function refreshDepartments(accessToken: string): Promise<void> {

  console.log("Fetching departments...");
  const result = await fetchDepartments(
    accessToken,
    {
      page_size: 100
    }
  );
//  console.log("Departments result:", JSON.stringify(result, null, 2));
  if (result.error) {
    throw result.error;
  }
  // TODO - deal with pagination
  let count = 0;
  for (const rampDepartment of result.model!.data) {
    console.log(`Department ${rampDepartment.id}: ${rampDepartment.name}`);
    const department: Department = {
      id: rampDepartment.id,
      name: rampDepartment.name,
    }
    await dbRamp.department.upsert({
      where: {id: department.id},
      update: department,
      create: department,
    });
    // Any error thrown by Prisma will be forwarded back to the caller
    count++;
  }
  console.log("Departments refreshed:", count);

}

