"use server";

/**
 * Server Actions for Bills.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils/ServerLogger";
import type { BillBill, BillListResponse } from "./Models";

// Private Objects ------------------------------------------------------------

const BILL_DEVELOPER_KEY = process.env.BILL_DEVELOPER_KEY;
const BILL_PROD_API_BASE_URL = process.env.BILL_PROD_API_BASE_URL;

// Validate presence of required environment variables
if (!BILL_DEVELOPER_KEY) {
  throw new Error("BILL_DEVELOPER_KEY is not set");
}
if (!BILL_PROD_API_BASE_URL) {
  throw new Error("BILL_PROD_API_BASE_URL is not set");
}

// Public Objects ------------------------------------------------------------

/**
 * Query parameters for fetchUsers().
 */
export type FetchBillsParams = {
  // TODO: support filtering and sorting options.
  // Number of results to return on each page (2-100). [20]
  max?: number;
  // The ID of the next page or previous page, for pagination
  page?: string;
}

/**
 * Fetch all or selected Bills from the Bill API.
 */
export async function fetchBills(
  // The session ID to use for authentication
  sessionId: string,
  // Optional query parameters for filtering and pagination
  params: FetchBillsParams
): Promise<BillListResponse<BillBill>> {

  const url = new URL(`${BILL_PROD_API_BASE_URL}/v3/bills`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "devKey": BILL_DEVELOPER_KEY!,
      "sessionId": sessionId,
    },
    method: "GET",
  });

  if (!response.ok) {
    const body = await response.json();
    logger.error({
      context: "fetchBills",
      message: "Failed to fetch bills",
      status: response.status,
      url: url.toString(),
      body,
    });
    const text = JSON.stringify(body, null, 2);
    throw new Error(`Error fetching users: ${text}`);
  } else {
    return await response.json();
  }

}
