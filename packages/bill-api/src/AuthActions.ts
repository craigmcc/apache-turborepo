"use server";

/**
 * Server Actions for Bill Authentication.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { BillLoginRequest, BillLoginResponse } from "./Models";

// Private Objects ------------------------------------------------------------

const BILL_DEVELOPER_KEY = process.env.BILL_DEVELOPER_KEY;
const BILL_ORGANIZATION_ID = process.env.BILL_ORGANIZATION_ID;
const BILL_PASSWORD = process.env.BILL_PASSWORD;
const BILL_PROD_API_BASE_URL = process.env.BILL_PROD_API_BASE_URL;
const BILL_USERNAME = process.env.BILL_USERNAME;

/**
 * Fetch a fresh session ID from the Bill API.
 */
export async function fetchSessionId(): Promise<string> {

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

  // Request a session ID from the Bill API
  const request: BillLoginRequest = {
    devKey: BILL_DEVELOPER_KEY,
    orgId: BILL_ORGANIZATION_ID,
    password: BILL_PASSWORD,
    userName: BILL_USERNAME,
  }
  const response = await fetch(`${BILL_PROD_API_BASE_URL}/login`, {
    body: JSON.stringify(request),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
//      "Content-Type": "application/x-www-form-urlencoded",
    },
    // body: new URLSearchParams({
    //   devKey: BILL_DEVELOPER_KEY,
    //   orgId: BILL_ORGANIZATION_ID,
    //   password: BILL_PASSWORD,
    //   userName: BILL_USERNAME,
    // }),
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch session ID: ${errorText}`);
  }

  const data: BillLoginResponse = await response.json();
  return data.sessionId;

}
