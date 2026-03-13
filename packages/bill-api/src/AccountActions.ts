"use server";

/**
 * Server Actions for Chart of Accounts.  This is a Bill V2 API, so it is a bit funky.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils";
import { type BillAccount, BillAccountTypes } from "./Models";

// Private Objects ------------------------------------------------------------

const BILL_DEVELOPER_KEY = process.env.BILL_DEVELOPER_KEY;
//const BILL_PROD_API_BASE_URL = process.env.BILL_PROD_API_BASE_URL;

// Validate presence of required environment variables
if (!BILL_DEVELOPER_KEY) {
  throw new Error("BILL_DEVELOPER_KEY is not set");
}
// if (!BILL_PROD_API_BASE_URL) {
//   throw new Error("BILL_PROD_API_BASE_URL is not set");
// }

// Public Objects ------------------------------------------------------------

/**
 * Fetch all Chart of Accounts from the Bill API.
 */
export async function fetchAccounts(sessionId: string): Promise<BillAccount[]> {

  const url: URL = new URL(`https://api.bill.com/api/v2/List/ChartOfAccount.json`);
  const requestData = {
    devKey: BILL_DEVELOPER_KEY!,
    sessionId: sessionId,
    data: '{"start":0, "max": 999}',
  }

  const response = await fetch(url, {
    body: new URLSearchParams(requestData).toString(),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    logger.error({
      context: "fetchAccounts.receive",
      status: response.status,
      statusText: response.statusText,
      url: url,
      response: JSON.stringify(await response.json()),
    });
    throw new Error(`Failed to receive Chart of Accounts: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (json.response_status === 0) {
    const accounts= json.response_data as BillAccount[];
    // Substitute meaningful descriptions for account types
    for (const account of accounts) {
      if (account.accountType && BillAccountTypes.has(account.accountType)) {
        account.accountType = BillAccountTypes.get(account.accountType)!;
      }
    }
    return accounts;
  } else {
    logger.error({
      context: "fetchAccounts.process",
      response_status: json.response_status,
      response_message: json.response_message,
      response_data: json.response_data,
    });
    throw new Error(`Failed to process Chart of Accounts: ${JSON.stringify(json, null, 2)}`);
  }

}
