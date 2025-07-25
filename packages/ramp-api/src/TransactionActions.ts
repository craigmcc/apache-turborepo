"use server";

/**
 * Server Actions for Transactions.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import type { RampResult, RampTransaction, RampTransactionsResponse } from "./Models.d.ts";
import {RampTransactionState, RampTransactionSyncStatus} from "./Models";

// Private Objects ------------------------------------------------------------

const RAMP_PROD_API_BASE_URL = process.env.RAMP_PROD_API_BASE_URL;

// Data Types ----------------------------------------------------------------

/**
 * Query parameters for fetchTransactions().
 */
export type FetchTransactionsParams = {
  // Filter by awaiting approval by user id
  awaiting_approval_by_user_id?: string;
  // Filter by card id
  card_id?: string;
  // Filter by department id
  department_id?: string;
  // Filter by entity id
  entity_id?: string;
  // Filter by accounting date >= from date
  from_date?: string;
  // Filter by limit id
  limit_id?: string;
  // Filter by location id
  location_id?: string;
  // Filter by merchant id
  merchant_id?: string;
  // Number of results to return on each page (2-100). [20]
  page_size?: number;
  // Filter by requires memo but does not have one (only set to true)
  requires_memo?: boolean;
  // Filter by Ramp category id
  sk_category_id?: string;
  // The ID of the last entry on the previous page, for pagination
  start?: string;
  // Filter by state (ALL means including declined transactions)
  state?: RampTransactionState;
  // Filter by statement id
  statement_id?: string;
  // Filter by sync status
  sync_status?: RampTransactionSyncStatus;
  // Filter by transaction date <= to date
  to_date?: string;
  // Filter by trip id
  trip_id?: string;
  // Filter by user id
  user_id?: string;
}

// Public Objects ------------------------------------------------------------

/**
 * Fetch a Transaction by ID.
 */
export async function fetchTransaction(
  // The access token to use for authentication
  accessToken: string,
  // The ID of the card to fetch
  transactionId: string
): Promise<RampResult<RampTransaction>> {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/transactions/${transactionId}`);

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
      model: await response.json() as RampTransaction,
    }
  }

}

/**
 * Fetch all or selected transactions from the Ramp API.
 */
export async function fetchTransactions(
  // The access token to use for authentication
  accessToken: string,
  // Optional query parameters
  params: FetchTransactionsParams = {}
): Promise<RampResult<RampTransactionsResponse>> {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/transactions`);
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
      model: await response.json() as RampTransactionsResponse,
    }
  }

}
