/**
 * Server Actions for QuickBooks Online Authentication.
 */

// External Modules ----------------------------------------------------------

import { QboApiInfo, WellKnownInfo } from "@repo/qbo-api/types/Types";
import { serverLogger as logger } from "@repo/shared-utils/*";
import * as crypto from "node:crypto";

// Internal Modules ----------------------------------------------------------

import {
  OAuthAuthorizationRequest,
  OAuthTokenRequest,
  OAuthTokenResponse,
} from "@/types/Types";

// Private Objects -----------------------------------------------------------

// Load relevant environment variables
const QBO_BASE_URL = process.env.QBO_BASE_URL;
const QBO_CLIENT_ID = process.env.QBO_CLIENT_ID;
const QBO_CLIENT_SECRET = process.env.QBO_CLIENT_SECRET;
const QBO_ENVIRONMENT = process.env.QBO_ENVIRONMENT;
const QBO_MINOR_VERSION = process.env.QBO_MINOR_VERSION;
const QBO_REALM_ID = process.env.QBO_REALM_ID;
const QBO_REDIRECT_PORT = process.env.QBO_REDIRECT_PORT;
const QBO_WELL_KNOWN_URL = process.env.QBO_WELL_KNOWN_URL;

// Validate presence of required environment variables
if (!QBO_BASE_URL) {
  throw new Error("QBO_BASE_URL is not set");
}
if (!QBO_CLIENT_ID) {
  throw new Error("QBO_CLIENT_ID is not set");
}
if (!QBO_CLIENT_SECRET) {
  throw new Error("QBO_CLIENT_SECRET is not set");
}
if (!QBO_ENVIRONMENT) {
  throw new Error("QBO_ENVIRONMENT is not set");
}
if (!QBO_MINOR_VERSION) {
  throw new Error("QBO_MINOR_VERSION is not set");
}
if (!QBO_REALM_ID) {
  throw new Error("QBO_REALM_ID is not set");
}
if (!QBO_REDIRECT_PORT) {
  throw new Error("QBO_REDIRECT_PORT is not set");
}
if (!QBO_WELL_KNOWN_URL) {
  throw new Error("QBO_WELL_KNOWN_URL is not set");
}

// Private Objects -----------------------------------------------------------

// Information required for OAuth authorization request
const oauthScope: string = "com.intuit.quickbooks.accounting";
const oauthState: string = crypto.randomBytes(32).toString("hex");

// Information to be returned from the OAuth token response
//let accessToken: string = "";
//let refreshToken: string = "";

// Public Objects ------------------------------------------------------------

export async function fetchApiInfo(): Promise<QboApiInfo> {

  // Fetch Well Known Info
  const wellKnownUrl = new URL(QBO_WELL_KNOWN_URL!);
  const wellKnownResponse = await fetch(wellKnownUrl);
  if (!wellKnownResponse.ok) {
    throw new Error(`Failed to fetch Well Known Info: ${wellKnownResponse.status} ${wellKnownResponse.statusText}`);
  }
  const wellKnownInfo: WellKnownInfo = await wellKnownResponse.json();
  logger.info({
    context: "AuthActions.fetchApiInfo",
    message: "Fetched Well Known Info",
    wellKnownInfo,
  });

  // Request an authorization code

  const authorizationRequest: OAuthAuthorizationRequest = {
    client_id: QBO_CLIENT_ID!,
    redirect_uri: `http://localhost:${QBO_REDIRECT_PORT!}/callback`,
    response_type: "code",
    scope: oauthScope,
    state: oauthState,
  }

  const authorizationUrl = new URL(wellKnownInfo.authorization_endpoint);
  authorizationUrl.searchParams.set("client_id", authorizationRequest.client_id);
  authorizationUrl.searchParams.set("redirect_uri", authorizationRequest.redirect_uri);
  authorizationUrl.searchParams.set("response_type", authorizationRequest.response_type);
  authorizationUrl.searchParams.set("scope", authorizationRequest.scope);
  authorizationUrl.searchParams.set("state", authorizationRequest.state!);
  logger.info({
    context: "AuthActions.fetchApiInfo",
    message: "Redirecting to authorization URL",
    authorizationUrl: authorizationUrl.toString(),
  });

  const authorizationResponse = await fetch(authorizationUrl, {
    method: "GET",
    redirect: "manual"
  });
  if (!authorizationResponse.ok) {
    throw new Error(`Failed to request authorization code: ${authorizationResponse.status} ${authorizationResponse.statusText}`);
  }
  logger.info({
    context: "AuthActions.fetchApiInfo",
    message: "Authorization code requested, awaiting redirect",
    status: authorizationResponse.status,
    headers: authorizationResponse.headers,
  });

  // Extract code and state from redirect URL

  const redirectUrl = authorizationResponse.headers.get("location");
  if (!redirectUrl) {
    throw new Error("No redirect URL found in authorization response");
  }
  const urlObj = new URL(redirectUrl);
  const authorizationCode = urlObj.searchParams.get("code");
  const returnedState = urlObj.searchParams.get("state");
  if (returnedState !== oauthState) {
    throw new Error("State mismatch in authorization response");
  }
  if (!authorizationCode) {
    throw new Error("No authorization code found in redirect URL");
  }
  logger.info({
    context: "AuthActions.fetchApiInfo",
    message: "Received authorization code",
    redirectUrl,
    authorizationCode,
  });

  // Use authorization code to request access token and refresh token

  const tokenRequest: OAuthTokenRequest = {
    client_id: QBO_CLIENT_ID!,
    client_secret: QBO_CLIENT_SECRET!,
    code: authorizationCode,
    grant_type: "authorization_code",
    redirect_uri: authorizationRequest.redirect_uri,
  };

  const tokenResponse = await fetch(wellKnownInfo.token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(tokenRequest),
  });
  if (!tokenResponse.ok) {
    throw new Error(`Failed to request access token: ${tokenResponse.status} ${tokenResponse.statusText}`);
  }
  const tokenResponseData: OAuthTokenResponse = await tokenResponse.json();
  logger.info({
    context: "AuthActions.fetchApiInfo",
    message: "Received access token and refresh token",
    tokenResponseData,
  });

  // Construct and return our QboApiInfo

  const qboApiInfo: QboApiInfo = {
    accessToken: tokenResponseData.access_token,
    baseUrl: QBO_BASE_URL!,
    minorVersion: QBO_MINOR_VERSION!,
    realmId: QBO_REALM_ID!,
    refreshToken: tokenResponseData.refresh_token,
  }
  logger.info({
    context: "AuthActions.fetchApiInfo",
    message: "Constructed QboApiInfo",
    qboApiInfo,
  });
  return qboApiInfo;

}
