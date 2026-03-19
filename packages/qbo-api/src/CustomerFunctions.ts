/**
 * Server-only functions for Customers.
 */

// External Modules ----------------------------------------------------------

import { serverLogger } from "@repo/shared-utils";

// Internal Modules ----------------------------------------------------------

import { QboCustomer } from "@/types/IntuitNameTypes";
import { QboApiInfo } from "@/types/Types";

// Public Objects ------------------------------------------------------------

/**
 * Query parameters for fetchCustomers
 */
export type FetchCustomersParams = {
  startPosition?: number;
  maxResults?: number;
}

/**
 * Fetch Customers from the QBO API.
 */
export async function fetchCustomers(apiInfo: QboApiInfo, params: FetchCustomersParams): Promise<QboCustomer[]> {

  const startPosition = params.startPosition || 1;
  const maxResults = params.maxResults || 100;

  const query =
    `SELECT * FROM Customer WHERE active IN (true, false) STARTPOSITION ${startPosition} MAXRESULTS ${maxResults}`;
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
    serverLogger.error({
      context: "CustomerFunctions.fetchCustomers",
      message: "Failed to fetch Customers",
      url,
      body: response.body,
      status: response.status,
      response: response.body,
    });
    const text = JSON.stringify(response.body, null, 2);
    throw new Error(`Error fetching customers: ${text}`);
  } else {
    const json = await response.json();
/*
    console.log("<<<<<<<<<<");
    console.log(JSON.stringify(json, null, 2));
    console.log("<<<<<<<<<<");
*/
    return json.QueryResponse.Customer || [];
  }

}
