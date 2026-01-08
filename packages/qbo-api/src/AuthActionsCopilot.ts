// TypeScript
// AuthActions.ts - helpers for Intuit/QBO OAuth2 token exchange and refresh

const QBO_OAUTH_AUTHORIZE = process.env.QBO_OAUTH_AUTHORIZE ?? "https://appcenter.intuit.com/connect/oauth2";
const QBO_OAUTH_TOKEN = process.env.QBO_OAUTH_TOKEN ?? "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const CLIENT_ID = process.env.QBO_CLIENT_ID!;
const CLIENT_SECRET = process.env.QBO_CLIENT_SECRET!;
const REDIRECT_URI = process.env.QBO_REDIRECT_URI!; // must match exactly the redirect URI registered with Intuit

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  throw new Error("QBO_CLIENT_ID, QBO_CLIENT_SECRET and QBO_REDIRECT_URI must be set");
}

/**
 * Build the authorization URL to open in a browser (one-time interactive consent).
 * Use `state` for CSRF protection and include the scopes your app needs.
 */
export function buildAuthUrl(state: string, scopes: string[] = ["com.intuit.quickbooks.accounting"]): string {
  const url = new URL(QBO_OAUTH_AUTHORIZE);
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("state", state);
  // add "prompt=consent" if you want to force new consent
  return url.toString();
}

/**
 * Exchange an authorization code (received at the redirect URI) for access + refresh tokens.
 * This is normally done once during initial setup; persist the returned refresh_token securely.
 */
export async function exchangeAuthCodeForTokens(code: string): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  });

  const resp = await fetch(QBO_OAUTH_TOKEN, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    },
    body: body.toString(),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`Token exchange failed: ${resp.status} ${JSON.stringify(data)}`);
  }
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  };
}

/**
 * Use a stored refresh token to obtain a fresh access token (for batch jobs).
 * Persist the new refresh_token returned on success (Intuit rotates refresh tokens).
 */
export async function refreshAccessToken(storedRefreshToken: string): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: storedRefreshToken,
  });

  const resp = await fetch(QBO_OAUTH_TOKEN, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    },
    body: body.toString(),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`Refresh token failed: ${resp.status} ${JSON.stringify(data)}`);
  }

  // Important: Intuit rotates refresh tokens. Save data.refresh_token back to secure storage.
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  };
}
