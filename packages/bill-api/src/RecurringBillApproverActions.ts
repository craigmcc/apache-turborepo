"use server";

/**
 * Server Actions for Recurring Bill Approvers.  This is a Bill V2 API, so it is a bit funky.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils";
import { BillRecurringBillApprover } from "./Models";

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

/*
curl --request POST \
     --url https://api-stage.bill.com/api/v2/List/RecurringBillApprover.json \
     --header 'accept: application/json' \
     --header 'content-type: application/x-www-form-urlencoded' \
     --data devKey=string \
     --data sessionId=string \
     --data 'data={"start":0,"max":999,"sort":[{"field":"string","asc":"string"}]}'
 */

/**
 * Fetch all Recurring Bill Approvers from the Bill API.
 */
export async function fetchRecurringBillApprovers(sessionId: string): Promise<BillRecurringBillApprover[]> {

  let start = 0;
  const results: BillRecurringBillApprover[] = [];

  while (true) {

    const url: URL = new URL(`https://api.bill.com/api/v2/List/RecurringBillApprover.json`);
    const requestData = {
      devKey: BILL_DEVELOPER_KEY!,
      sessionId: sessionId,
      data: `{"start":${start}, "max":999, "sort":[{"field":"id","asc":"true"}]}`,
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
        context: "fetchRecurringBillApprovers.receive",
        status: response.status,
        statusText: response.statusText,
        url: url,
        request: requestData,
        response: JSON.stringify(await response.json()),
      });
      throw new Error(`Failed to receive Bill Approvers: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
/*
    logger.info({
      context: "fetchRecurringBillApprovers.receive",
      status: response.status,
      statusText: response.statusText,
      url: url,
      request: requestData,
      response: json,
    });
*/
    if (json.response_status === 0) {
      const approvers= json.response_data as BillRecurringBillApprover[];
      if (approvers.length === 0) {
        break; // No more approvers to fetch
      }
      results.push(...approvers);
    } else {
      logger.error({
        context: "fetchBillRecurringApprovers.process",
        request: requestData,
        response_status: json.response_status,
        response_message: json.response_message,
        response_data: json.response_data,
      });
      throw new Error(`Failed to process Bill Approvers: ${JSON.stringify(json, null, 2)}`);
    }
    start += 1000; // Increment start for next batch

  }

  return results;

}
