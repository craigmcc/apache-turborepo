"use server";

/**
 * Server Actions for Departments.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { logger } from "@/lib/ServerLogger";
import { DepartmentsResponse, RampDepartment, RampResult } from "@/types/Models";

// Private Objects ------------------------------------------------------------

const RAMP_PROD_API_BASE_URL = process.env.RAMP_PROD_API_BASE_URL;

// Data Types ----------------------------------------------------------------

/**
 * Query parameters for fetchDepartments().
 */
export type FetchDepartmentsParams = {
  // Number of results to return on each page (2-100). [20]
  page_size?: number;
  // The ID of the last entry on the previous page, for pagination
  start?: string;
}

// Public Objects ------------------------------------------------------------

/**
 * Fetch a Department by ID.
 */
export async function fetchDepartment(
  // The access token to use for authentication
  accessToken: string,
  // The ID of the department to fetch
  departmentId: string
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

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/departments/${departmentId}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  logger.trace({
    context: "DepartmentActions.fetchDepartment",
    url: url.toString(),
    response: response,
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
    model: body as RampDepartment,
  }
}

/**
 * Fetch all or selected departments from the Ramp API.
 */
export async function fetchDepartments(
  // The access token to use for authentication
  accessToken: string,
  // Optional query parameters
  params?: FetchDepartmentsParams
): Promise<RampResult<DepartmentsResponse>> {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/departments`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return {
      error: await response.json()
    };
  }

  const result = await response.json() as RampResult<DepartmentsResponse>;
  logger.info({
    context: "DepartmentActions.fetchDepartments",
    url: url.toString(),
    result: result,
  });

  return result;

}
