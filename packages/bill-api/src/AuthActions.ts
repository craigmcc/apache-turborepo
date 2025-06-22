"use server";

/**
 * Server Actions for Bill Authentication.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils/ServerLogger";
import { BillLoginRequest, BillLoginResponse } from "./Models";

// Private Objects ------------------------------------------------------------

const BILL_DEVELOPER_KEY = process.env.BILL_DEVELOPER_KEY;
const BILL_ORGANIZATION_ID = process.env.BILL_ORGANIZATION_ID;
const BILL_PASSWORD = process.env.BILL_PASSWORD;
const BILL_PROD_API_BASE_URL = process.env.BILL_PROD_API_BASE_URL;
const BILL_USERNAME = process.env.BILL_USERNAME;

// Validate presence of required environment variables
if (!BILL_DEVELOPER_KEY) {
  throw new Error("BILL_DEVELOPER_KEY is not set");
}
if (!BILL_ORGANIZATION_ID) {
  throw new Error("BILL_ORGANIZATION_ID is not set");
}
if (!BILL_PASSWORD) {
  throw new Error("BILL_PASSWORD is not set");
}
if (!BILL_PROD_API_BASE_URL) {
  throw new Error("BILL_PROD_API_BASE_URL is not set");
}
if (!BILL_USERNAME) {
  throw new Error("BILL_USERNAME is not set");
}

/**
 * Fetch a fresh session ID from the Bill API.
 */
export async function fetchSessionId(): Promise<string> {

  const request: BillLoginRequest = {
    devKey: BILL_DEVELOPER_KEY!,
    organizationId: BILL_ORGANIZATION_ID!,
    password: BILL_PASSWORD!,
    username: BILL_USERNAME!,
  }
  const url = new URL(`${BILL_PROD_API_BASE_URL}/v3/login`);

  const response = await fetch(url, {
    body: JSON.stringify(request),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body = await response.json();
    logger.error({
      context: "fetchSessionId",
      message: "Failed to fetch session ID",
      status: response.status,
      url: url.toString(),
      body,
    });
    const text = JSON.stringify(body, null, 2);
    throw new Error(`Failed to fetch session ID: ${text}`);
  } else {
    const data: BillLoginResponse = await response.json();
    return data.sessionId;
  }

}
