"use server";

/**
 * Server Actions for SpendPrograms.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import type { RampResult, RampSpendProgram, RampSpendProgramsResponse } from "./Models.d.ts";

// Private Objects ------------------------------------------------------------

const RAMP_PROD_API_BASE_URL = process.env.RAMP_PROD_API_BASE_URL;

// Data Types ----------------------------------------------------------------

/**
 * Query parameters for fetchSpendPrograms().
 */
export type FetchSpendProgramsParams = {
  // Number of results to return on each page (2-100). [20]
  page_size?: number;
  // The ID of the last entry on the previous page, for pagination
  start?: string;
}

// Public Objects ------------------------------------------------------------

/**
 * Fetch a SpendProgram by ID.
 */
export async function fetchSpendProgram(
  // The access token to use for authentication
  accessToken: string,
  // The ID of the card to fetch
  spendProgramId: string
): Promise<RampResult<RampSpendProgram>> {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/spend-programs/${spendProgramId}`);

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
      model: await response.json() as RampSpendProgram,
    }
  }

}

/**
 * Fetch all or selected spendPrograms from the Ramp API.
 */
export async function fetchSpendPrograms(
  // The access token to use for authentication
  accessToken: string,
  // Optional query parameters
  params: FetchSpendProgramsParams = {}
): Promise<RampResult<RampSpendProgramsResponse>> {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/spend-programs`);
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
      headers: response.headers,
    };
  } else {
    return {
      headers: response.headers,
      model: await response.json() as RampSpendProgramsResponse,
    }
  }

}
