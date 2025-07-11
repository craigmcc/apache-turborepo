"use server";

/**
 * Server Actions for Limits.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import type { RampResult, RampLimit, RampLimitsResponse } from "./Models.d.ts";

// Private Objects ------------------------------------------------------------

const RAMP_PROD_API_BASE_URL = process.env.RAMP_PROD_API_BASE_URL;

// Data Types ----------------------------------------------------------------

/**
 * Query parameters for fetchLimits().
 */
export type FetchLimitsParams = {
  // Filter by limit display name
  display_name?: string;
  // Filter by entity id
  entity_id?: string;
  // Filter by is terminated
  is_terminated?: boolean;
  // Number of results to return on each page (2-100). [20]
  page_size?: number;
  // Filter by spend program id
  spend_program_id?: string;
  // The ID of the last entry on the previous page, for pagination
  start?: string;
}

// Public Objects ------------------------------------------------------------

/**
 * Fetch a Limit by ID.
 */
export async function fetchLimit(
  // The access token to use for authentication
  accessToken: string,
  // The ID of the card to fetch
  limitId: string
): Promise<RampResult<RampLimit>> {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/limits/${limitId}`);

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
      headers: response.headers,
    };
  } else {
    return {
      headers: response.headers,
      model: await response.json() as RampLimit,
    }
  }

}

/**
 * Fetch all or selected limits from the Ramp API.
 */
export async function fetchLimits(
  // The access token to use for authentication
  accessToken: string,
  // Optional query parameters
  params: FetchLimitsParams = {}
): Promise<RampResult<RampLimitsResponse>> {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/limits`);
  Object.entries(params).forEach(([key, value]) => {
    if (value || typeof value === "boolean") {
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
      headers: response.headers,
    };
  } else {
    return {
      headers: response.headers,
      model: await response.json() as RampLimitsResponse,
    }
  }

}
