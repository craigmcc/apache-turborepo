"use server";

/**
 * Server Actions for AccountingGLAccounts.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import type { RampResult, RampAccountingGLAccount, RampAccountingGLAccountsResponse } from "./Models.d.ts";

// Private Objects ------------------------------------------------------------

const RAMP_PROD_API_BASE_URL = process.env.RAMP_PROD_API_BASE_URL;

// Data Types ----------------------------------------------------------------

/**
 * Query parameters for fetchAccountingGLAccounts().
 */
export type FetchAccountingGLAccountsParams = {
  // Filter only for activated cards.  Defaults to false if not specified
  is_active?: boolean;
  // Filter only for synced cards.  Defaults to false if not specified
  is_synced?: boolean;
  // Number of results to return on each page (2-100). [20]
  page_size?: number;
  // The ID of the last entry on the previous page, for pagination
  start?: string;
}

// Public Objects ------------------------------------------------------------

/**
 * Fetch an account by ID.
 */
export async function fetchAccountingGLAccount(
  // The access token to use for authentication
  accessToken: string,
  // The ID of the card to fetch
  accountingGLAccountId: string
): Promise<RampResult<RampAccountingGLAccount>> {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/accounting/accounts/${accountingGLAccountId}`);

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
      model: await response.json() as RampAccountingGLAccount,
    }
  }

}

/**
 * Fetch all or selected GL accounts from the Ramp API.
 */
export async function fetchAccountingGLAccounts(
  // The access token to use for authentication
  accessToken: string,
  // Optional query parameters
  params: FetchAccountingGLAccountsParams = {}
): Promise<RampResult<RampAccountingGLAccountsResponse>> {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/accounting/accounts`);
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
      model: await response.json() as RampAccountingGLAccountsResponse,
    }
  }

}
