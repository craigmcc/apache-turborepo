/**
 * Functions to return the entire contents of specific models
 * via the Ramp API and store them in a local database.
 */

// External Modules ----------------------------------------------------------

// Internal Modules -----------------------------------------------------------

import { fetchAccessToken } from "@repo/ramp-api/AuthActions";
import { fetchDepartments } from "@repo/ramp-api/DepartmentActions";
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
  let count = 0;
  let nextStart: string | null = "";
  while (nextStart !== null) {

    const result = await fetchDepartments(
      accessToken,
      {
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
//    console.log("fetchDepartments result:", JSON.stringify(result, null, 2));
    if (result.error) {
      throw result.error;
    }

    for (const rampDepartment of result.model!.data) {
//      console.log(`Department ${rampDepartment.id}: ${rampDepartment.name}`);
      const department: Department = {
        // id: rampDepartment.id,
        // name: rampDepartment.name,
        ...rampDepartment
      }
      await dbRamp.department.upsert({
        where: {id: department.id},
        update: department,
        create: department,
      });
      // Any error thrown by Prisma will be forwarded back to the caller
      count++;
      nextStart = result.model!.page?.next || null;
    }

    console.log("Departments refreshed:", count);

  }

}
