/**
 * Server-only functions for Accounts.
 */

// External Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils";

// Internal Modules ----------------------------------------------------------

import type { QboAccount } from "@/types/Finance";
import type { QboApiInfo } from "@/types/Types";

// Private Objects -----------------------------------------------------------

// Public Objects ------------------------------------------------------------

/**
 * Query parameters for fetchAccounts().
 */
export type FetchAccountsParams = {
  startPosition?: number;
  maxResults?: number;
}

/**
 * Fetch Accounts from the QBO API.
 */
export async function fetchAccounts(apiInfo: QboApiInfo, params: FetchAccountsParams): Promise<QboAccount[]> {

  const startPosition = params.startPosition || 1;
  const maxResults = params.maxResults || 100;

  const query =
    `SELECT * FROM Account WHERE active IN (true, false) STARTPOSITION ${startPosition} MAXRESULTS ${maxResults}`;
  const url = new URL(`${apiInfo.baseUrl}/v3/company/${apiInfo.realmId}/query?`);
  url.searchParams.set("minversion", apiInfo.minorVersion);
  url.searchParams.set("query", query);

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${apiInfo.accessToken}`,
    }
  });

  if (!response.ok) {
    logger.error({
      context: "AccountActions.fetchAccounts",
      message: "Failed to fetch Accounts",
      url,
      body: response.body,
      status: response.status,
      response: response.body,
    });
    const text = JSON.stringify(response.body, null, 2);
    throw new Error(`Error fetching accounts: ${text}`);
  } else {
    const json = await response.json();
    const accounts: QboAccount[] = json.QueryResponse.Account || [];
    return accounts;
  }

}
