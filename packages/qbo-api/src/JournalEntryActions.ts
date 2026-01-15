"use server"

/**
 * Server Actions for QboJournalEntries.
 */

// External Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils/*";

// Internal Modules ----------------------------------------------------------

import type { QboJournalEntry } from "@/types/Finance";
import type { QboApiInfo } from "@/types/Types";

// Private Objects -----------------------------------------------------------

// Public Objects ------------------------------------------------------------

/**
 * Query parameters for fetchJournalEntries().
 */
export type FetchAccountsParams = {
  startPosition?: number;
  maxResults?: number;
}

/**
 * Fetch JournalEntries from the QBO API.
 */
export async function fetchJournalEntries(apiInfo: QboApiInfo, params: FetchAccountsParams): Promise<QboJournalEntry[]> {

  const startPosition = params.startPosition || 1;
  const maxResults = params.maxResults || 100;

  const query =
    `SELECT * FROM JournalEntry STARTPOSITION ${startPosition} MAXRESULTS ${maxResults}`;
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
      context: "JournalEntryActions.fetchJournalEntries",
      message: "Failed to fetch JournalEntries",
      url,
      body: response.body,
      status: response.status,
      response: response.body,
    });
    const text = JSON.stringify(response.body, null, 2);
    throw new Error(`Error fetching accounts: ${text}`);
  } else {
    const json = await response.json();
    return json.QueryResponse.JournalEntry || [];
  }

}
