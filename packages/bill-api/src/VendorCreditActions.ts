"use server";

/**
 * Server Actions for Vendor Credits.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils";
import type { BillListResponse, BillVendorCredit } from "./Models";

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
 * Query parameters for fetchVendorCredits().
 */
export type FetchVendorCreditsParams = {
  // TODO: support filtering and sorting options.
  // Number of results to return on each page (2-100). [20]
  max?: number;
  // The ID of the next page or previous page, for pagination
  page?: string;
}

/**
 * Fetch all or selected Vendor Credits from the Bill API.
 */
export async function fetchVendorCredits(
  // The session ID to use for authentication
  sessionId: string,
  // Optional query parameters for filtering and pagination
  params: FetchVendorCreditsParams
): Promise<BillListResponse<BillVendorCredit>> {

  const url = new URL(`${BILL_PROD_API_BASE_URL}/v3/vendor-credits`);
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
      context: "fetchVendorCredits",
      message: "Failed to fetch vendor credits",
      status: response.status,
      url: url.toString(),
      body,
    });
    const text = JSON.stringify(body, null, 2);
    throw new Error(`Error fetching vendor credits: ${text}`);
  } else {
    return await response.json();
  }

}
