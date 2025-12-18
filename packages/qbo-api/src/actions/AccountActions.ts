"use server"

/**
 * Server Actions for Accounts.
 */

// External Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils/ServerLogger";

// Internal Modules ----------------------------------------------------------

import type { QboAccount } from "@/types/Finance";

// Private Objects -----------------------------------------------------------

const QBO_BASE_URL = process.env.QBO_BASE_URL;
const QBO_MINOR_VERSION = process.env.QBO_MINOR_VERSION || "75";
const QBO_REALM_ID = process.env.QBO_REALM_ID;

// Validate presence of required environment variables
if (!QBO_BASE_URL) {
  throw new Error("QBO_BASE_URL is not set");
}
if (!QBO_REALM_ID) {
  throw new Error("QBO_REALM_ID is not set");
}

// Public Objects ------------------------------------------------------------

/**
 * Query parameters for fetchAccounts().
 */
export type FetchAccountsParams = {
  // Access token for authentication
  accessToken: string;
  // Maximum number of results to return (max 1000)
  maxResults?: number;
  // Starting position for pagination (1-based)
  startPosition?: number;
}

/**
 * Fetch Accounts from the QBO API.
 */
export async function fetchAccounts(
  { accessToken, maxResults, startPosition }: FetchAccountsParams,
): Promise<QboAccount[]> {

  const url =
    new URL(`${QBO_BASE_URL}/v3/company/${QBO_REALM_ID}/query?minorversion=${QBO_MINOR_VERSION}`);
  const body =
    `SELECT * FROM Account STARTPOSITION ${startPosition} MAXRESULTS ${maxResults}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/text",
    },
    body: body,
  });

  if (!response.ok) {
    logger.error({
      context: "AccountActions.fetchAccounts",
      message: "Failed to fetch Accounts",
      url,
      body,
      status: response.status,
      response: response.body,
    });
    const text = JSON.stringify(response.body, null, 2);
    throw new Error(`Error fetching accounts: ${text}`);
  } else {
    return await response.json();
  }

}
