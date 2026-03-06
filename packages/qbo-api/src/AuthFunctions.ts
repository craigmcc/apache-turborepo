/**
 * Server-only actions for QuickBooks Online Authentication.
 */

// External Modules ----------------------------------------------------------

import { serverLogger as logger } from "@repo/shared-utils";
import * as crypto from "node:crypto";
import path from "path";
import { promises as fs } from "fs";

// Internal Modules ----------------------------------------------------------

import {
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
  context: "AuthFunctions.initialization",
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
let readyPromise: Promise<void> | null = null;

// Lazy-initialized runtime values (populated by ensureInitialized)
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

  // Create a readyPromise that resolves when initial init (including any
  // refresh-token based token retrieval) has completed.
  readyPromise = new Promise<void>((resolve) => {
    (async () => {
      try {
        oauthState = crypto.randomBytes(32).toString("hex");

        if (!isCi) {
          cachedRefreshToken = await fetchCachedRefreshToken();
          wellKnownInfo = await fetchWellKnownInfo();

          // If we have a cached refresh token, attempt to obtain an access token
          if (cachedRefreshToken) {
            try {
              const refreshed = await refreshAccessTokenUsingRefreshToken(wellKnownInfo!, cachedRefreshToken);
              qboApiInfo.accessToken = refreshed.accessToken;
              qboApiInfo.refreshToken = refreshed.refreshToken;
              // persist any new refresh token
              if (refreshed.refreshToken) {
                try { await storeCachedRefreshToken(refreshed.refreshToken); } catch { /* non-fatal */ }
              }
              completed = true;
              logger.info({ context: 'AuthFunctions.ensureInitialized', message: 'Refreshed access token from cached refresh token' });
            } catch (err) {
              // Log and continue; interactive flow may be required later
              logger.warn({ context: 'AuthFunctions.ensureInitialized', message: 'Failed to refresh token from cached refresh token', error: err });
            }
          }
        } else {
          // CI environment: populate wellKnownInfo with placeholders
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

      } catch (e) {
        logger.error({ context: 'AuthFunctions.ensureInitialized', message: 'Initialization failed', error: e });
      } finally {
        // Resolve regardless; callers may choose to proceed or handle missing tokens
        resolve();
      }
    })();
  });

  return readyPromise;
}

/**
 * Refresh access token using a refresh token (refresh_token grant)
 */
async function refreshAccessTokenUsingRefreshToken(wellKnown: QboWellKnownInfo, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const token = Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`, 'utf8').toString('base64');
  const resp = await fetch(wellKnown.token_endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Failed to refresh token: ${resp.status} ${resp.statusText} ${text}`);
  }

  const data = await resp.json() as { access_token?: string; refresh_token?: string };
  logger.trace({ context: 'AuthFunctions.refreshAccessTokenUsingRefreshToken', message: 'Refresh response', data });
  return {
    accessToken: data.access_token ?? '',
    refreshToken: data.refresh_token ?? refreshToken,
  };
}

// Public Objects ------------------------------------------------------------

// Document environment variables
logger.trace({
  context: "AuthFunctions.environment",
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

     // Hold interactive-auth promise if it is started.
     let authPromise: Promise<void> | undefined = undefined;
     if (!completed && !isCi) {
       try {
         // In test environments we don't want to open a real browser. Provide
         // an opener that simulates the user completing authorization by
         // calling the redirect URL with a code and state. In non-test
         // environments, leave opener undefined so the real browser is opened.
         let opener: ((url: string) => Promise<void>) | undefined = undefined;
         if (process.env.NODE_ENV === 'test') {
           opener = async (authUrl: string) => {
             try {
               const parsed = new URL(authUrl);
               const state = parsed.searchParams.get('state');
               const redirectBase = QBO_REDIRECT_URL!;
               const redirectUrl = new URL(redirectBase);
               redirectUrl.searchParams.set('code', 'code-from-auth');
               if (state) redirectUrl.searchParams.set('state', state);
               const http = await import('node:http');
               await new Promise<void>((resolve) => {
                 http.get(redirectUrl.toString(), () => resolve()).on('error', () => resolve());
               });
             } catch (e) {
               logger.warn({ context: 'AuthFunctions.fetchApiInfo', message: 'Test opener failed', error: e });
             }
           };
         }

         // Start the interactive flow and capture the promise.
         authPromise = startInteractiveAuthorization(wellKnownInfo!, opener).catch((err: unknown) => {
           logger.warn({ context: 'AuthFunctions.fetchApiInfo', message: 'Interactive authorization failed to start', error: err });
         });
       } catch (e) {
         logger.warn({ context: 'AuthFunctions.fetchApiInfo', message: 'Failed to initiate interactive authorization', error: e });
       }
     }

     // If a timeout was provided, wait until `completed` becomes true (i.e. we
    // have refreshed tokens) or until timeoutMs expires. If timeoutMs is 0,
    // return immediately (caller may handle interactive auth themselves).
    if (timeoutMs > 0) {
      if (authPromise) {
        // Wait for either the auth promise to resolve or the timeout
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
        try {
          await Promise.race([authPromise, sleep(timeoutMs)]);
        } catch {
          // ignore; we'll check completed below
        }
      } else {
        // Fallback to polling completed
        const start = Date.now();
        const pollInterval = 250;
        while (!completed && (Date.now() - start) < timeoutMs) {
          await new Promise((r) => setTimeout(r, pollInterval));
        }
      }
      if (!completed) {
        throw new Error('Timeout waiting for authorization to complete');
      }
    }

    // If no access token was obtained during initialization/refresh, fail fast
    // with a descriptive error rather than returning an object with an empty
    // accessToken (which would lead to confusing 400 responses from the API).
    // Populate refreshToken from cachedRefreshToken for callers that want it.
    if (!qboApiInfo.accessToken || qboApiInfo.accessToken.trim() === "") {
      // expose any cachedRefreshToken for diagnostic purposes
      if (cachedRefreshToken && !qboApiInfo.refreshToken) {
        qboApiInfo.refreshToken = cachedRefreshToken;
      }
      throw new Error('No access token available. Interactive authorization is required or refresh failed.');
    }

    return qboApiInfo;
}

// Express Server for Receiving Redirects ------------------------------------

// NOTE: The express-based redirect server is intentionally not created at
// module import time to avoid side-effects during builds. If runtime code
// needs to start an OAuth redirect server, a separate function should be
// provided to start it explicitly.

// Private Objects -----------------------------------------------------------

/**
 * Fetch the cached refresh token, if there is one.
 */
async function fetchCachedRefreshToken(): Promise<string | null> {
  try {
    const raw = await fs.readFile(REFRESH_TOKEN_PATH, "utf8");
    const token = raw.trim();
    return token.length ? token : null;
  } catch (err: unknown) {
    const e = err as { code?: string } | undefined;
    if (e && e.code === "ENOENT") return null;
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
    context: "AuthFunctions.fetchWellKnownInfo",
    message: "Fetched Well Known Info",
    wellKnownInfo,
  });
  return wellKnownInfo;

}

/**
 * Store the cached refresh token (delegates to internal module).
 */
async function storeCachedRefreshToken(refreshToken: string): Promise<void> {
  const m = await import('./internal/AuthInternal');
  return m.storeCachedRefreshToken(refreshToken);
}

/**
 * Re-export internal exchangeAuthorizationCodeForTokens for tests that import it
 * from the public module. This keeps the implementation private while making
 * the helper available where tests expect it.
 */
export async function exchangeAuthorizationCodeForTokens(
  wellKnownInfo: QboWellKnownInfo,
  authorizationCode: string,
  redirectUrl: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const m = await import('./internal/AuthInternal');
  return m.exchangeAuthorizationCodeForTokens(wellKnownInfo, authorizationCode, redirectUrl);
}

/**
 * Start the interactive authorization flow.
 * Accepts an optional openUrlFn so callers/tests can inject a custom opener.
 */
export async function startInteractiveAuthorization(
  wellKnown: QboWellKnownInfo,
  openUrlFn?: (url: string) => Promise<void>
): Promise<void> {
  // Ensure oauthState; ensureInitialized normally does this, but caller
  // might invoke directly when testing.
  if (!oauthState) oauthState = crypto.randomBytes(32).toString('hex');
  const m = await import('./internal/AuthInternal');
  return m.startInteractiveAuthorization(wellKnown, oauthState, async (a, r) => {
     qboApiInfo.accessToken = a;
     qboApiInfo.refreshToken = r;
     try { await storeCachedRefreshToken(r); } catch { /* swallow */ }
     // mark completed so fetchApiInfo will stop waiting
     completed = true;
   }, openUrlFn);
}

/**
 * Initialize the auth subsystem (non-blocking). Call at app startup to
 * trigger fetching well-known info and attempting refresh-token flow.
 * This helper avoids doing work at module import time yet allows apps to
 * eagerly initialize auth when running.
 */
 export async function initAuth(): Promise<void> {
   await ensureInitialized();
 }
