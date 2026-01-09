/**
 * Server Actions for QuickBooks Online Authentication.
 */

// External Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils/*";
import { exec } from "node:child_process";
import * as crypto from "node:crypto";
import express from "express";
import { promises as fs } from "fs";
import path from "path";

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

const REFRESH_TOKEN_FILENAME = `.env.${QBO_ENVIRONMENT}.qbo_refresh_token.txt`;
const REFRESH_TOKEN_PATH = path.join(process.cwd(), REFRESH_TOKEN_FILENAME);

// Private Objects -----------------------------------------------------------

// Deferred promise until we have QBO API Info
let readyResolve!: (value?: void | PromiseLike<void>) => void;
const readyPromise: Promise<void> = new Promise((resolve) => {
  readyResolve = resolve;
});


// Information shared between authorization steps
const cachedRefreshToken: string | null = await fetchCachedRefreshToken();
const credentials = "Basic " + Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`).toString("base64");
const oauthState: string = crypto.randomBytes(32).toString("hex");
const wellKnownInfo: QboWellKnownInfo = await fetchWellKnownInfo();

// Tokens MUST be filled in before this can be returned!
const qboApiInfo: QboApiInfo = {
  accessToken: "",
  baseUrl: QBO_BASE_URL!,
  minorVersion: QBO_MINOR_VERSION!,
  realmId: QBO_REALM_ID!,
  refreshToken: "",
}

// Public Objects ------------------------------------------------------------

// Document environment variables
logger.trace({
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

  logger.trace({
    context: "AuthActions.attemptRefresh",
    cachedRefreshToken,
  });

  const refreshRequest: OAuthRefreshRequest = {
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
    // Refresh failed, so fall through to the full authorization code flow

  } else {

    const refreshResponseData: OAuthRefreshResponse = await refreshResponse.json();
    logger.info({
      context: "AuthActions.attemptRefresh.success",
      message: "Successfully refreshed tokens",
//      refreshResponseData,
    });

    // Set the tokens we need
    qboApiInfo.accessToken = refreshResponseData.access_token;
    qboApiInfo.refreshToken = refreshResponseData.refresh_token;

    // Store the new refresh token
    await storeCachedRefreshToken(refreshResponseData.refresh_token);

    // Return the API info now that we have tokens
    if (readyResolve) readyResolve();

  }

} else {

  // No cached refresh token, so trigger the full authorization code flow
  try {
    const authorizationUrl = await requestAuthorizationUrl(wellKnownInfo); // now returns URL string
    logger.info({
      context: "AuthActions.startAuthFlow",
      message: "Opening browser for QBO authorization",
      authorizationUrl,
    });
    await openUrl(authorizationUrl);
    // leave readyPromise unresolved until express callback receives tokens
  } catch (err) {
    logger.error({
      context: "AuthActions.startAuthFlow",
      message: "Failed to start authorization flow",
      error: err,
    });
  }

}

/**
 * Fetch the QBO API Information, waiting for authorization if necessary.
 *
 * @param timeoutMs Number of milliseconds to wait before timing out (0 = no timeout)
 * @returns QboApiInfo object with access and refresh tokens
 * @throws Error if timeout occurs before authorization is complete
 *
 * NOTE: The timeout should be sufficient for a user to manually authenticate
 */
export async function fetchApiInfo(timeoutMs: number = 0): Promise<QboApiInfo> {
  if (timeoutMs > 0) {
    // race between readyPromise and a timeout
    await Promise.race([
      readyPromise,
      new Promise<void>((_, reject) => setTimeout(() => reject(new Error("Timed out waiting for QBO auth info")), timeoutMs)),
    ]);
  } else {
    await readyPromise;
  }
  return qboApiInfo;
}

// Express Server for Receiving Redirects ------------------------------------

const app = express();
const web_path = extractPathFromUrl(QBO_REDIRECT_URL!);
const port = extractPortFromUrl(QBO_REDIRECT_URL!);

app.get(web_path, async (req, res) => {

  // Receive authorization code and check state for a match

  const authorizationCode = req.query.code as string;
  const state = req.query.state as string;

  if (state !== oauthState) {
    logger.error({
      context: "AuthActions.expressCallback",
      message: "State mismatch in OAuth callback",
      expectedState: oauthState,
      receivedState: state,
    });
    res.status(400).send("State mismatch");
    return;
  }

  logger.trace({
    context: "AuthActions.expressCallback",
    message: "Received OAuth callback",
    authorizationCode,
    state,
  });

  const { accessToken, refreshToken } = await exchangeAuthorizationCodeForTokens(
    wellKnownInfo,
    authorizationCode,
    QBO_REDIRECT_URL
  );
  logger.trace({
    context: "AuthActions.expressCallback",
    message: "Exchanged authorization code for tokens",
    accessToken,
    refreshToken,
  });

  // Save the received tokens, and persist the refresh token
  qboApiInfo.accessToken = accessToken;
  qboApiInfo.refreshToken = refreshToken;
  await storeCachedRefreshToken(refreshToken);

  // Resolve waiting callers now that we have the tokens
  if (readyResolve) readyResolve();

  // Tell the user they can close the window now
  res.status(200).send("Authorization successful! You can close this window.");

});

// TODO - this will not work on production environment
app.listen(port, () => {
  logger.info({
    context: "AuthActions.expressListen",
    message: `OAuth Redirect Server listening at http://localhost:${port}${web_path}`,
  });
});

// Private Objects -----------------------------------------------------------

/**
 * Exchange an authorization code for an access token and refresh token.
 */
async function exchangeAuthorizationCodeForTokens(
  wellKnownInfo: QboWellKnownInfo,
  authorizationCode: string,
  redirectUrl: string
): Promise<{ accessToken: string; refreshToken: string }> {

  const tokenRequest: OAuthTokenRequest = {
    code: authorizationCode,
    grant_type: "authorization_code",
    redirect_uri: redirectUrl,
  };
  logger.trace({
    context: "AuthActions.exchangeAuthorizationCodeForTokens",
    message: "Exchanging authorization code for tokens",
    tokenRequest
  });

  const token =
    Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`, "utf8").toString("base64");
  const tokenResponse = await fetch(wellKnownInfo.token_endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(tokenRequest),
  });
  const tokenResponseData = await tokenResponse.json();
  logger.trace({
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
 * Extract the path from a URL string.
 */
function extractPathFromUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    return url.pathname;
  } catch (error) {
    logger.error({
      context: "AuthActions.extractPathFromUrl",
      message: "Invalid URL string",
      urlString,
      error,
    });
    throw new Error("Missing path in URL");
  }
}

/**
 * Extract the port number from a URL string.
 */
function extractPortFromUrl(urlString: string): number {
  try {
    const url = new URL(urlString);
    return url.port ? parseInt(url.port, 10) : (url.protocol === "https:" ? 443 : 80);
  } catch (error) {
    logger.error({
      context: "AuthActions.extractPortFromUrl",
      message: "Invalid URL string",
      urlString,
      error,
    });
    throw new Error("Missing port in URL");
  }
}

/**
 * Fetch the cached refresh token, if there is one.
 */
async function fetchCachedRefreshToken(): Promise<string | null> {
  try {
    const raw = await fs.readFile(REFRESH_TOKEN_PATH, "utf8");
    const token = raw.trim();
    return token.length ? token : null;
  } catch (err : any) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}

/**
 * Return the Well Known Information for QuickBooks Online OAuth.
 */
async function fetchWellKnownInfo(): Promise<QboWellKnownInfo> {

  const wellKnownUrl = new URL(QBO_WELL_KNOWN_URL!);
  const response = await fetch(wellKnownUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch Well Known Info: ${response.status} ${response.statusText}`);
  }

  const wellKnownInfo: QboWellKnownInfo = await response.json();
  logger.trace({
    context: "AuthActions.fetchWellKnownInfo",
    message: "Fetched Well Known Info",
    wellKnownInfo,
  });
  return wellKnownInfo;

}

/**
 * Request an authorization URL from QuickBooks Online OAuth.
 */
async function
  requestAuthorizationUrl(wellKnownInfo: QboWellKnownInfo): Promise<string> {

  const authorizationRequest: OAuthAuthorizationRequest = {
    client_id: QBO_CLIENT_ID!,
    redirect_uri: QBO_REDIRECT_URL!,
    response_type: "code",
    scope: "com.intuit.quickbooks.accounting",
    state: oauthState,
  };
  logger.trace({
    context: "AuthActions.requestAuthorizationCode",
    message: "Constructing authorization URL",
    authorizationRequest,
  });

  const authorizationUrl = new URL(wellKnownInfo.authorization_endpoint);
  authorizationUrl.searchParams.set("client_id", authorizationRequest.client_id);
  authorizationUrl.searchParams.set("redirect_uri", authorizationRequest.redirect_uri);
  authorizationUrl.searchParams.set("response_type", authorizationRequest.response_type);
  authorizationUrl.searchParams.set("scope", authorizationRequest.scope);
  authorizationUrl.searchParams.set("state", authorizationRequest.state!);

  logger.trace({
    context: "AuthActions.requestAuthorizationCode",
    message: "Constructed authorization URL",
    authorizationUrl: authorizationUrl.toString(),
  });

  return authorizationUrl.toString();

}

/**
 * Open a URL in the user's default browser in a cross-platform way.
 * - macOS: `open`
 * - Windows: `cmd /c start "" <url>`
 * - Linux: `xdg-open` (falls back to `gio open`)
 */
function openUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = process.platform;
    const quoted = JSON.stringify(url); // safe quoting
    let cmd: string;

    if (p === "darwin") {
      cmd = `open ${quoted}`;
    } else if (p === "win32") {
      // use cmd /c start "" "<url>" to avoid interpreting the first arg as a title
      cmd = `cmd /c start "" ${quoted}`;
    } else {
      // assume linux / unix
      cmd = `xdg-open ${quoted}`;
    }

    exec(cmd, (err) => {
      if (!err) return resolve();

      // On some Linux desktops xdg-open may not be available; try gio as fallback
      if (p !== "darwin" && p !== "win32") {
        exec(`gio open ${quoted}`, (err2) => {
          return err2 ? reject(err2) : resolve();
        });
        return;
      }

      reject(err);
    });
  });
}

/**
 * Store the cached refresh token.
 */
async function storeCachedRefreshToken(refreshToken: string): Promise<void> {
  const tmpPath = REFRESH_TOKEN_PATH + ".tmp";
  // ensure token ends with newline for readability
  const payload = refreshToken.trim() + "\n";
  await fs.writeFile(tmpPath, payload, { encoding: "utf8", mode: 0o600 });
  await fs.rename(tmpPath, REFRESH_TOKEN_PATH);
}
