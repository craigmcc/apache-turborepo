/**
 * Server Actions for QuickBooks Online Authentication.
 */

// External Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils/*";
import * as crypto from "node:crypto";

// Internal Modules ----------------------------------------------------------

import {
  OAuthAuthorizationRequest,
  OAuthRefreshRequest,
  OAuthRefreshResponse,
  OAuthTokenRequest,
  OAuthTokenResponse,
  QboApiInfo,
  QboWellKnownInfo
} from "@/types/Types";

// Private Objects -----------------------------------------------------------

// Load relevant environment variables
const QBO_BASE_URL = process.env.QBO_BASE_URL;
const QBO_CLIENT_ID = process.env.QBO_CLIENT_ID;
const QBO_CLIENT_SECRET = process.env.QBO_CLIENT_SECRET;
const QBO_ENVIRONMENT = process.env.QBO_ENVIRONMENT;
const QBO_MINOR_VERSION = process.env.QBO_MINOR_VERSION;
const QBO_REALM_ID = process.env.QBO_REALM_ID;
const QBO_REDIRECT_URL = process.env.QBO_REDIRECT_URL;
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
if (!QBO_REDIRECT_URL) {
  throw new Error("QBO_REDIRECT_URL is not set");
}
if (!QBO_WELL_KNOWN_URL) {
  throw new Error("QBO_WELL_KNOWN_URL is not set");
}

// Private Objects -----------------------------------------------------------

// Information shared between authorization steps
const cachedRefreshToken: string | null = await fetchCachedRefreshToken();
const credentials = "Basic " + Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`).toString("base64");
const oauthState: string = crypto.randomBytes(32).toString("hex");
const wellKnownInfo: QboWellKnownInfo = await fetchWellKnownInfo();

// Public Objects ------------------------------------------------------------

// Tokens MUST be filled in before this can be used!
export const qboApiInfo: QboApiInfo = {
  accessToken: "",
  baseUrl: QBO_BASE_URL!,
  minorVersion: QBO_MINOR_VERSION!,
  realmId: QBO_REALM_ID!,
  refreshToken: "",
}

// Document environment variables
logger.info({
  context: "AuthActions.environment",
  message: "Environment Variables",
  QBO_BASE_URL,
  QBO_CLIENT_ID,
  QBO_ENVIRONMENT,
  QBO_MINOR_VERSION,
  QBO_REALM_ID,
  QBO_REDIRECT_URL,
  QBO_WELL_KNOWN_URL,
});

// If we have a cached refresh token, try to use it directly
if (cachedRefreshToken) {

  logger.info({
    context: "AuthActions.attemptRefresh",
    cachedRefreshToken,
  });

  const refreshRequest: OAuthRefreshRequest = {
//    client_id: QBO_CLIENT_ID!,
//    client_secret: QBO_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: cachedRefreshToken,
  };
  const refreshResponse = await fetch(wellKnownInfo.token_endpoint, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": credentials,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(refreshRequest),
  });

  if (!refreshResponse.ok) {
    logger.error({
      context: "AuthActions.attemptRefresh.failure",
      message: "Failed to refresh tokens",
      status: refreshResponse.status,
      statusText: refreshResponse.statusText,
    });
    // Fall through to full authorization code flow
  } else {

    const refreshResponseData: OAuthRefreshResponse = await refreshResponse.json();
    logger.info({
      context: "AuthActions.attemptRefresh.success",
      message: "Successfully refreshed tokens",
      refreshResponseData,
    });

    // Set the tokens we need
    qboApiInfo.accessToken = refreshResponseData.access_token;
    qboApiInfo.refreshToken = refreshResponseData.refresh_token;

    // Store the new refresh token
    await storeCachedRefreshToken(refreshResponseData.refresh_token);

    // TODO: go do the updates!
  }

}

// TODO: Do the full authorization code flow, including storeRefreshToken().


  export async function fetchApiInfo(): Promise<void> {



  // Perform authorization code flow
  const { authorizationCode, redirectUrl } = await requestAuthorizationCode(wellKnownInfo);
  const { accessToken, refreshToken } = await exchangeAuthorizationCodeForTokens(
    wellKnownInfo,
    authorizationCode,
    redirectUrl
  );

  // Construct and return our QboApiInfo
  // TODO - it'll be exported when we get the tokens

}

// Helper Functions ----------------------------------------------------------

/**
 * Exchange an authorization code for an access token and refresh token.
 */
export async function exchangeAuthorizationCodeForTokens(
  wellKnownInfo: QboWellKnownInfo,
  authorizationCode: string,
  redirectUrl: string
): Promise<{ accessToken: string; refreshToken: string }> {

  const tokenRequest: OAuthTokenRequest = {
    client_id: QBO_CLIENT_ID!,
    client_secret: QBO_CLIENT_SECRET!,
    code: authorizationCode,
    grant_type: "authorization_code",
    redirect_uri: redirectUrl,
  };
  logger.info({
    context: "AuthActions.exchangeAuthorizationCodeForTokens",
    message: "Exchanging authorization code for tokens",
    tokenRequest
  });

  const tokenResponse = await fetch(wellKnownInfo.token_endpoint, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(tokenRequest),
  });
  const tokenResponseData: OAuthTokenResponse = await tokenResponse.json();
  logger.info({
    context: "AuthActions.exchangeAuthorizationCodeForTokens",
    message: "Received access token and refresh token",
    tokenResponseData,
  });

  return {
    accessToken: tokenResponseData.access_token,
    refreshToken: tokenResponseData.refresh_token,
  };

}

/**
 * Fetch the cached refresh token, if there is one.
 */
async function fetchCachedRefreshToken(): Promise<string | null> {
  return "RT1-9-H0-1776308828253480qvlv4o20ja3izh"; // TODO - get a real one
}

/**
 * Return the Well Known Information for QuickBooks Online OAuth.
 */
export async function fetchWellKnownInfo(): Promise<QboWellKnownInfo> {

  const wellKnownUrl = new URL(QBO_WELL_KNOWN_URL!);
  const response = await fetch(wellKnownUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch Well Known Info: ${response.status} ${response.statusText}`);
  }

  const wellKnownInfo: QboWellKnownInfo = await response.json();
  logger.info({
    context: "AuthActions.fetchWellKnownInfo",
    message: "Fetched Well Known Info",
    wellKnownInfo,
  });
  return wellKnownInfo;

}

/**
 * Request an authorization code from QuickBooks Online OAuth.
 */
export async function
  requestAuthorizationCode(wellKnownInfo: QboWellKnownInfo):
  Promise<{ authorizationCode: string; redirectUrl: string }> {

  const authorizationRequest: OAuthAuthorizationRequest = {
    client_id: QBO_CLIENT_ID!,
    redirect_uri: QBO_REDIRECT_URL!,
    response_type: "code",
    scope: "com.intuit.quickbooks.accounting",
    state: oauthState,
  }

  const authorizationUrl = new URL(wellKnownInfo.authorization_endpoint);
  authorizationUrl.searchParams.set("client_id", authorizationRequest.client_id);
  authorizationUrl.searchParams.set("redirect_uri", authorizationRequest.redirect_uri);
  authorizationUrl.searchParams.set("response_type", authorizationRequest.response_type);
  authorizationUrl.searchParams.set("scope", authorizationRequest.scope);
  authorizationUrl.searchParams.set("state", authorizationRequest.state!);
  logger.info({
    context: "AuthActions.requestAuthorizationCode",
    message: "Fetching from authorization URL",
    authorizationUrl: authorizationUrl.toString(),
  });

  const authorizationResponse = await fetch(authorizationUrl, {
    method: "GET",
    redirect: "manual"
  });
  logger.info({
    context: "AuthActions.requestAuthorizationCode",
    message: "Received authorization response",
    status: authorizationResponse.status,
    headers: authorizationResponse.headers,
    body: authorizationResponse.body,
  });
  if (!authorizationResponse.ok) {
    logger.error({
      context: "AuthActions.fetchApiInfo",
      message: "Failed to request authorization code",
      status: authorizationResponse.status,
      statusText: authorizationResponse.statusText,
      authorizationUrl: authorizationUrl.toString(),
      authorizationResponse
    })
    throw new Error(`Failed to request authorization code: ${authorizationResponse.status} ${authorizationResponse.statusText}`);
  }
  logger.info({
    context: "AuthActions.requestAuthorizationCode",
    message: "Authorization code received",
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
    context: "AuthActions.requestAuthorizationCode",
    message: "Received authorization code",
    authorizationCode,
    redirectUrl,
  });
  return { authorizationCode, redirectUrl };

}

/**
 * Store the cached refresh token.
 */
async function storeCachedRefreshToken(refreshToken: string): Promise<void> {
  // TODO - implement real storage
}
