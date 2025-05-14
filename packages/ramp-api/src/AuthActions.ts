"use server";

/**
 * Server Actions for Authentication.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import type { RampResult, RampTokenResponse } from "./Models.d.ts";

// Private Objects ------------------------------------------------------------

const RAMP_PROD_API_BASE_URL = process.env.RAMP_PROD_API_BASE_URL;
const RAMP_PROD_API_CLIENT_ID = process.env.RAMP_PROD_API_CLIENT_ID;
const RAMP_PROD_API_CLIENT_SECRET = process.env.RAMP_PROD_API_CLIENT_SECRET;
const RAMP_PROD_API_SCOPE = process.env.RAMP_PROD_API_SCOPE;

// Public Objects ------------------------------------------------------------

/**
 * Fetch a fresh access token from the Ramp API.
 */
export async function fetchAccessToken(): Promise<RampResult<RampTokenResponse>> {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }
  if (!RAMP_PROD_API_CLIENT_ID) {
    return {
      error: {
        error_code: "RAMP_PROD_API_CLIENT_ID_NOT_SET",
        message: "RAMP_PROD_API_CLIENT_ID is not set",
        status: 500
      }
    };
  }
  if (!RAMP_PROD_API_CLIENT_SECRET) {
    return {
      error: {
        error_code: "RAMP_PROD_API_CLIENT_SECRET_NOT_SET",
        message: "RAMP_PROD_API_CLIENT_SECRET is not set",
        status: 500
      }
    };
  }
  if (!RAMP_PROD_API_SCOPE) {
    return {
      error: {
        error_code: "RAMP_PROD_API_SCOPE_NOT_SET",
        message: "RAMP_PROD_API_SCOPE is not set",
        status: 500
      }
    };
  }

  const url = `${RAMP_PROD_API_BASE_URL}/developer/v1/token`;
  const headers = {
    "Accept": "application/json",
    "Authorization": "Basic " + btoa(`${RAMP_PROD_API_CLIENT_ID}:${RAMP_PROD_API_CLIENT_SECRET}`),
    "Content-Type": "application/x-www-form-urlencoded",
  }
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: `${RAMP_PROD_API_SCOPE}`,
  });

  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      error: {...error, status: response.status},
      headers: response.headers,
    };
  }

  const data = await response.json();
  return {
    headers: response.headers,
    model: data as RampTokenResponse,
  }

}
