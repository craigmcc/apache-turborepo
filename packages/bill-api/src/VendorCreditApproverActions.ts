"use server";

/**
 * Server Actions for Vendor Credit Approvers.  This is a Bill V2 API, so it is a bit funky.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils";
import { BillApproverStatuses, BillVendorCreditApprover } from "./Models";

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
 * Fetch all Vendor Credit Approvers from the Bill API.
 */
export async function fetchVendorCreditApprovers(sessionId: string): Promise<BillVendorCreditApprover[]> {

  const url: URL = new URL(`https://api.bill.com/api/v2/List/VendorCreditApprover.json`);
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
      context: "fetchVendorCreditApprovers.receive",
      status: response.status,
      statusText: response.statusText,
      url: url,
      response: JSON.stringify(await response.json()),
    });
    throw new Error(`Failed to receive Vendor Credit Approvers: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (json.response_status === 0) {
    const approvers= json.response_data as BillVendorCreditApprover[];
    // Substitute meaningful descriptions for account types
    for (const approver of approvers) {
      if (approver.status && BillApproverStatuses.has(approver.status)) {
        approver.status = BillApproverStatuses.get(approver.status) || "Unknown";
      }
    }
    return approvers;
  } else {
    logger.error({
      context: "fetchVendorCreditApprovers.process",
      response_status: json.response_status,
      response_message: json.response_message,
      response_data: json.response_data,
    });
    throw new Error(`Failed to process Vendor Credit Approvers: ${JSON.stringify(json, null, 2)}`);
  }

}
