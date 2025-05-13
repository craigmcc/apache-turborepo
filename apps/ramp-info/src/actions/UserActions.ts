"use server";

/**
 * Server Actions for Users.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { RampResult, RampUser, UsersResponse } from "@/types/Models";

// Private Objects ------------------------------------------------------------

const RAMP_PROD_API_BASE_URL = process.env.RAMP_PROD_API_BASE_URL;

// Data Types ----------------------------------------------------------------

/**
 * Query parameters for fetchUsers().
 */
export type FetchUsersParams = {
  // Filter by department id
  department_id?: string;
  // Filter by email
  email?: string;
  // Filter by employee_id
  employee_id?: string;
  // Filter by entity id
  entity_id?: string;
  // Filter by location id
  location_id?: string;
  // Number of results to return on each page (2-100). [20]
  page_size?: number;
  // Filter by role -- TODO - these do not match values in the role field
  //role?: UserRole;
  // The ID of the last entry on the previous page, for pagination
  start?: string;
}

// Public Objects ------------------------------------------------------------

/**
 * Fetch a User by ID.
 */
export async function fetchUser(
  // The access token to use for authentication
  accessToken: string,
  // The ID of the user to fetch
  userId: string
) {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/users/${userId}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      error: { ...error, status: response.status },
    };
  }

  const body = await response.json();
  return {
    headers: response.headers,
    model: body as RampUser,
  }
}

/**
 * Fetch all or selected users from the Ramp API.
 */
export async function fetchUsers(
  // The access token to use for authentication
  accessToken: string,
  // Optional query parameters
  params: FetchUsersParams = {}
): Promise<RampResult<UsersResponse>> {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/users`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      error: { ...error, status: response.status },
    };
  }

  const body = await response.json();
  return {
    headers: response.headers,
    model: body as UsersResponse,
  }

}
