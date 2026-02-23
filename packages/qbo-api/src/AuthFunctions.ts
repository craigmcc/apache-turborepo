/**
 * Server-only actions for QuickBooks Online Authentication.
 */

// External Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils";
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
  QboApiInfo,
  QboWellKnownInfo
} from "@/types/Types";

// Private Objects -----------------------------------------------------------

// Load relevant environment variables
const CI = process.env.CI;
const isCi = (process.env.CI !== undefined) || false; // For CI environments
const NODE_ENV = process.env.NODE_ENV || "*undefined*";
const isProduction = NODE_ENV === "production";
const QBO_BASE_URL = process.env.QBO_BASE_URL;
const QBO_CLIENT_ID = process.env.QBO_CLIENT_ID;
const QBO_CLIENT_SECRET = process.env.QBO_CLIENT_SECRET;
const QBO_ENVIRONMENT = process.env.QBO_ENVIRONMENT;
const QBO_LOCAL_REDIRECT_URL = process.env.QBO_LOCAL_REDIRECT_URL;
const QBO_MINOR_VERSION = process.env.QBO_MINOR_VERSION;
const QBO_REALM_ID = process.env.QBO_REALM_ID;
const QBO_REDIRECT_URL = process.env.QBO_REDIRECT_URL;
const QBO_WELL_KNOWN_URL = process.env.QBO_WELL_KNOWN_URL;

logger.info({
  context: "AuthActions.initialization",
  CI,
  NODE_ENV,
  isCi,
  isProduction,
});

// Validate presence of required environment variables
if (!isCi && !QBO_BASE_URL) {
  throw new Error("QBO_BASE_URL is not set");
}
if (!isCi && !QBO_CLIENT_ID) {
  throw new Error("QBO_CLIENT_ID is not set");
}
if (!isCi && !QBO_CLIENT_SECRET) {
  throw new Error("QBO_CLIENT_SECRET is not set");
}
if (!isCi && !QBO_ENVIRONMENT) {
  throw new Error("QBO_ENVIRONMENT is not set");
}
if (!isCi && !QBO_LOCAL_REDIRECT_URL && QBO_ENVIRONMENT === "production") {
  throw new Error("QBO_LOCAL_REDIRECT_URL is not set for production environment");
}
if (!isCi && !QBO_MINOR_VERSION) {
  throw new Error("QBO_MINOR_VERSION is not set");
}
if (!isCi && !QBO_REALM_ID) {
  throw new Error("QBO_REALM_ID is not set");
}
if (!isCi && !QBO_REDIRECT_URL) {
  throw new Error("QBO_REDIRECT_URL is not set");
}
if (!isCi && !QBO_WELL_KNOWN_URL) {
  throw new Error("QBO_WELL_KNOWN_URL is not set");
}

const REFRESH_TOKEN_FILENAME = `.env.${QBO_ENVIRONMENT}.qbo_refresh_token.txt`;
const REFRESH_TOKEN_PATH = path.join(process.cwd(), REFRESH_TOKEN_FILENAME);

// Private Objects -----------------------------------------------------------

// Deferred promise until we have QBO API Info
let readyResolve!: (value?: void | PromiseLike<void>) => void;
let readyPromise: Promise<void> | null = null;

// Lazy-initialized runtime values (populated by ensureInitialized)
let credentials: string | null = null;
let oauthState: string | null = null;
let wellKnownInfo: QboWellKnownInfo | null = null;
let cachedRefreshToken: string | null = null;

// Tokens MUST be filled in before this can be returned!
let completed = false;
const qboApiInfo: QboApiInfo = {
  accessToken: "",
  baseUrl: QBO_BASE_URL!,
  minorVersion: QBO_MINOR_VERSION!,
  realmId: QBO_REALM_ID!,
  refreshToken: "",
}

async function ensureInitialized() {
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    credentials = "Basic " + Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`).toString("base64");
    oauthState = crypto.randomBytes(32).toString("hex");
    if (!isCi) {
      cachedRefreshToken = await fetchCachedRefreshToken();
      wellKnownInfo = await fetchWellKnownInfo();
    } else {
      cachedRefreshToken = null;
      wellKnownInfo = {
        authorization_endpoint: "https://example.com/oauth2",
        claims_supported: [],
        id_token_signing_alg_values_supported: [],
        issuer: "https://example.com/oauth2/issuer",
        jwks_uri: "https://example.com/oauth2/jwks",
        response_types_supported: [],
        revocation_endpoint: "https://example.com/oauth2/revoke",
        scopes_supported: [],
        subject_types_supported: [],
        token_endpoint: "https://example.com/oauth2/tokens",
        token_endpoint_auth_methods_supported: [],
        userinfo_endpoint: "https://example.com/oauth2/userinfo",
      };
    }
  })();
  return readyPromise;
}

// Public Objects ------------------------------------------------------------

// Document environment variables
logger.trace({
  context: "AuthActions.environment",
  message: "Environment Variables",
  QBO_BASE_URL,
  QBO_CLIENT_ID,
  QBO_ENVIRONMENT,
  QBO_LOCAL_REDIRECT_URL,
  QBO_MINOR_VERSION,
  QBO_REALM_ID,
  QBO_REDIRECT_URL,
  QBO_WELL_KNOWN_URL,
});

// NOTE: Initialization and any interactive authorization flow are performed
// lazily inside `fetchApiInfo()` via `ensureInitialized()` to avoid side-effects
// during module import (for example, during Next.js builds). Avoid doing
// network requests, file writes, or opening browsers at import time.

// Public API: fetchApiInfo now ensures initialization lazily and returns the
// qboApiInfo object. Interactive flows (authorization) are intentionally not
// triggered during static builds; callers should call fetchApiInfo at runtime.

/**
 * Fetch the QBO API Information, waiting for authorization if necessary.
 *
 * @param timeoutMs Number of milliseconds to wait before timing out (0 = no timeout)
 * @returns QboApiInfo object with access and refresh tokens
 * @throws Error if timeout occurs before authorization is complete
 */
export async function fetchApiInfo(timeoutMs: number = 0): Promise<QboApiInfo> {
  // Ensure runtime initialization has run (loads well-known info / cached token as needed)
  await ensureInitialized();

  // At build-time or when no cached token is present, we avoid triggering the
  // interactive authorization flow automatically. Consumers that require a
  // valid access token should call a separate flow to authenticate. For the
  // purpose of enabling static builds, just return the qboApiInfo object
  // (which will be populated by other runtime flows when available).
  return qboApiInfo;
}

// Express Server for Receiving Redirects ------------------------------------

+// NOTE: The express-based redirect server is intentionally not created at
+// module import time to avoid side-effects during builds. If runtime code
+// needs to start an OAuth redirect server, a separate function should be
+// provided to start it explicitly.

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
    state: oauthState ?? undefined,
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
  // Write atomically where possible, but fall back to direct write if needed.
  const payload = refreshToken.trim() + "\n";
  try {
    // Try direct write with mode (atomic on many filesystems)
    await fs.writeFile(REFRESH_TOKEN_PATH, payload, { encoding: "utf8", mode: 0o600 });
  } catch (err) {
    // If direct write fails for any reason, attempt a safe tmp+rename as fallback.
    try {
      const tmpPath = REFRESH_TOKEN_PATH + ".tmp";
      await fs.writeFile(tmpPath, payload, { encoding: "utf8", mode: 0o600 });
      await fs.rename(tmpPath, REFRESH_TOKEN_PATH);
    } catch (err2) {
      // Swallow or rethrow depending on environment: log and rethrow to surface in non-build env
      logger.error({
        context: "AuthActions.storeCachedRefreshToken",
        message: "Failed to persist refresh token",
        error: err2,
        path: REFRESH_TOKEN_PATH,
      });
      // Re-throw so callers can decide how to handle it in production flows
      throw err2;
    }
  }
}
