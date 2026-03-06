import { serverLogger as logger } from "@repo/shared-utils";
import { promises as fs } from "fs";
import express from "express";
import path from "path";
import { QboWellKnownInfo } from "@/types/Types";

const QBO_CLIENT_ID = process.env.QBO_CLIENT_ID;
const QBO_CLIENT_SECRET = process.env.QBO_CLIENT_SECRET;
const QBO_REDIRECT_URL = process.env.QBO_REDIRECT_URL;
const QBO_ENVIRONMENT = process.env.QBO_ENVIRONMENT;

const REFRESH_TOKEN_FILENAME = `.env.${QBO_ENVIRONMENT}.qbo_refresh_token.txt`;
const REFRESH_TOKEN_PATH = path.join(process.cwd(), REFRESH_TOKEN_FILENAME);

export function openUrl(url: string): Promise<void> {
  const p = process.platform;
  const quoted = JSON.stringify(url);
  let cmd: string;
  if (p === "darwin") {
    cmd = `open ${quoted}`;
  } else if (p === "win32") {
    cmd = `cmd /c start "" ${quoted}`;
  } else {
    cmd = `xdg-open ${quoted}`;
  }

  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const cp = await import('node:child_process');
        // Use the callback overload (error, stdout, stderr). Provide an empty options object
        // to disambiguate the overloads for TypeScript and avoid explicit type annotations
        // that can mismatch the ExecException vs ErrnoException types.
        cp.exec(cmd, {}, (error, stdout, stderr) => {
          // mark unused variables as used to satisfy lint rules
          void stdout;
          void stderr;
          if (!error) return resolve();
          if (p !== 'darwin' && p !== 'win32') {
            cp.exec(`gio open ${quoted}`, {}, (error2, _s2, _se2) => {
              void _s2; void _se2;
              return error2 ? reject(error2) : resolve();
            });
            return;
          }
          reject(error);
        });
      } catch (e) {
        reject(e);
      }
    })();
  });
}

export async function storeCachedRefreshToken(refreshToken: string): Promise<void> {
  const payload = refreshToken.trim() + "\n";
  try {
    await fs.writeFile(REFRESH_TOKEN_PATH, payload, { encoding: "utf8", mode: 0o600 });
  } catch {
    try {
      const tmpPath = REFRESH_TOKEN_PATH + ".tmp";
      await fs.writeFile(tmpPath, payload, { encoding: "utf8", mode: 0o600 });
      await fs.rename(tmpPath, REFRESH_TOKEN_PATH);
    } catch (err2) {
      logger.error({
        context: "AuthInternal.storeCachedRefreshToken",
        message: "Failed to persist refresh token",
        error: err2,
        path: REFRESH_TOKEN_PATH,
      });
      throw err2;
    }
  }
}

export async function exchangeAuthorizationCodeForTokens(
  wellKnownInfo: QboWellKnownInfo,
  authorizationCode: string,
  redirectUrl: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const tokenReq = new URLSearchParams({
    code: authorizationCode,
    grant_type: 'authorization_code',
    redirect_uri: redirectUrl,
  });
  const basic = Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`, 'utf8').toString('base64');
  const tokenResp = await fetch(wellKnownInfo.token_endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenReq.toString(),
  });
  if (!tokenResp.ok) {
    const t = await tokenResp.text().catch(() => '');
    throw new Error(`Token exchange failed: ${tokenResp.status} ${tokenResp.statusText} ${t}`);
  }
  const tokenResponseData = await tokenResp.json() as { access_token?: string; refresh_token?: string };
  return {
    accessToken: tokenResponseData.access_token ?? '',
    refreshToken: tokenResponseData.refresh_token ?? '',
  };
}

function extractPathFromUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    return url.pathname;
  } catch (error) {
    logger.error({ context: "AuthInternal.extractPathFromUrl", message: "Invalid URL string", urlString, error });
    throw new Error("Missing path in URL");
  }
}

function extractPortFromUrl(urlString: string): number {
  try {
    const url = new URL(urlString);
    return url.port ? parseInt(url.port, 10) : (url.protocol === "https:" ? 443 : 80);
  } catch (error) {
    logger.error({ context: "AuthInternal.extractPortFromUrl", message: "Invalid URL string", urlString, error });
    throw new Error("Missing port in URL");
  }
}

export async function startInteractiveAuthorization(
  wellKnown: QboWellKnownInfo,
  oauthState: string,
  setTokens: (access: string, refresh: string) => Promise<void>,
  openUrlFn?: (url: string) => Promise<void>
): Promise<void> {
  const opener = openUrlFn ?? openUrl;
  if (!QBO_REDIRECT_URL) throw new Error('QBO_REDIRECT_URL is not configured');
  return new Promise<void>((resolve, reject) => {
    const redirectPath = extractPathFromUrl(QBO_REDIRECT_URL);
    const redirectPort = extractPortFromUrl(QBO_REDIRECT_URL);

    const app = express();
    let server: ReturnType<typeof app.listen> | null = null;

    const cleanup = () => {
      try { if (server) server.close(); } catch { /* ignore */ }
    };

    app.get(redirectPath, async (req, res) => {
      try {
        logger.info({ context: 'AuthInternal.startInteractiveAuthorization', message: 'Received redirect callback', query: req.query });
        const q = req.query as Record<string, string | undefined>;
        const code = q.code;
        const state = q.state;
        const error = q.error;
        const error_description = q.error_description;
        if (error) {
          logger.error({ context: 'AuthInternal.startInteractiveAuthorization', message: 'OAuth returned error', error, error_description });
          res.status(400).send(`<h1>Authorization failed</h1><p>${String(error)} - ${String(error_description)}</p>`);
          cleanup();
          return reject(new Error(`OAuth error: ${error}`));
        }
        if (!code) {
          res.status(400).send('<h1>Missing authorization code</h1>');
          cleanup();
          return reject(new Error('Missing authorization code'));
        }
        if (!state || state !== oauthState) {
          res.status(400).send('<h1>Invalid state</h1>');
          cleanup();
          return reject(new Error('Invalid OAuth state'));
        }

        let tokens;
        try {
          logger.info({ context: 'AuthInternal.startInteractiveAuthorization', message: 'Exchanging code for tokens', code });
          // Use the wellKnown parameter passed into startInteractiveAuthorization
          tokens = await exchangeAuthorizationCodeForTokens(wellKnown as QboWellKnownInfo, code as string, QBO_REDIRECT_URL!);
          logger.info({ context: 'AuthInternal.startInteractiveAuthorization', message: 'Token exchange completed', tokens: { access: !!tokens?.accessToken, refresh: !!tokens?.refreshToken } });
        } catch (ex) {
          logger.error({ context: 'AuthInternal.startInteractiveAuthorization', message: 'Token exchange failed', error: ex });
          cleanup();
          return reject(ex);
        }

        try {
          logger.info({ context: 'AuthInternal.startInteractiveAuthorization', message: 'Calling setTokens' });
          await setTokens(tokens.accessToken, tokens.refreshToken);
          logger.info({ context: 'AuthInternal.startInteractiveAuthorization', message: 'setTokens completed' });
        } catch (e) {
          logger.warn({ context: 'AuthInternal.startInteractiveAuthorization', message: 'Failed to persist tokens', error: e });
        }

        res.send('<h1>Authorization complete</h1><p>You may close this window.</p>');
        logger.info({ context: 'AuthInternal.startInteractiveAuthorization', message: 'Responded to redirect and resolving' });
        cleanup();
        return resolve();
      } catch (e) {
        logger.error({ context: 'AuthInternal.startInteractiveAuthorization', message: 'Failed during authorization callback', error: e });
        try { res.status(500).send('<h1>Authorization error</h1>'); } catch { /* ignore */ }
        cleanup();
        return reject(e);
      }
    });

    server = app.listen(redirectPort, async () => {
      logger.info({ context: 'AuthInternal.startInteractiveAuthorization', message: `Listening for OAuth redirect on port ${redirectPort} path ${redirectPath}` });
      logger.info({ context: 'AuthInternal.startInteractiveAuthorization', message: 'Invoking opener now' });
      try {
        const authUrl = new URL(wellKnown.authorization_endpoint);
        authUrl.searchParams.set('client_id', QBO_CLIENT_ID!);
        authUrl.searchParams.set('redirect_uri', QBO_REDIRECT_URL!);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', 'com.intuit.quickbooks.accounting');
        authUrl.searchParams.set('state', oauthState);
        const authString = authUrl.toString();
        logger.info({ context: 'AuthInternal.startInteractiveAuthorization', message: 'Opening browser for interactive authorization', authUrl: authString });
        const openerResult = opener(authString);
        logger.info({ context: 'AuthInternal.startInteractiveAuthorization', message: 'Opener invoked', openerReturned: !!openerResult });
        await openerResult;
      } catch (e) {
        cleanup();
        return reject(e);
      }
    });
  });
}
