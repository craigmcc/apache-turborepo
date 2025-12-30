"use server"

/**
 * Server Actions for Accounts.
 */

// External Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils/*";

// Internal Modules ----------------------------------------------------------

import type { QboAccount } from "@/types/Finance";
import type { QboApiInfo } from "@/types/Types";

// Private Objects -----------------------------------------------------------

// Public Objects ------------------------------------------------------------

/**
 * Fetch Accounts from the QBO API.
 */
export async function fetchAccounts(apiInfo: QboApiInfo): Promise<QboAccount[]> {

  // TODO: turn this logic into a paginated fetch to get all accounts
  const startPosition = 1;
  const maxResults = 1000;

  const url =
    new URL(`${apiInfo.baseUrl}/v3/company/${apiInfo.realmId}/query?minorversion=${apiInfo.minorVersion}`);
  const body =
    `SELECT * FROM Account STARTPOSITION ${startPosition} MAXRESULTS ${maxResults}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${apiInfo.accessToken}`,
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
