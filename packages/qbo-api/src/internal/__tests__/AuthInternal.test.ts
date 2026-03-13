import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock child_process and fs before importing the module under test
vi.mock('node:child_process', () => ({
  exec: vi.fn((cmd: string, _opts: any, cb: (err: any, stdout: string, stderr: string) => void) => {
    cb(null, '', '');
  }),
}));

vi.mock('fs', () => ({
  promises: {
    writeFile: vi.fn(),
    rename: vi.fn(),
  },
}));

import { promises as fsMock } from 'fs';

// Add helper to retry http.get until server is ready
async function httpGetUntilReady(url: string, maxAttempts = 100, delayMs = 50) {
  const http = await import('node:http');
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const ok = await new Promise<boolean>((resolve) => {
      try {
        const req = http.get(url, () => resolve(true));
        req.on('error', () => resolve(false));
      } catch (e) {
        resolve(false);
      }
    });
    if (ok) return;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  // final attempt
  await new Promise<void>((resolve) => {
    try {
      const http2 = require('node:http');
      http2.get(url, () => resolve()).on('error', () => resolve());
    } catch (e) { resolve(); }
  });
}

describe('AuthInternal', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    // increase timeout to reduce CI flakiness
    // vi.setTimeout(20000); // removed because vi.setTimeout may not be available in some Vitest environments
    process.env.QBO_ENVIRONMENT = 'test';
    process.env.QBO_CLIENT_ID = 'cid';
    process.env.QBO_CLIENT_SECRET = 'csecret';
  });

  afterEach(() => {
    delete process.env.QBO_REDIRECT_URL;
    // clear any global fetch mocks that tests may have set
    try { delete (global as any).fetch; } catch { /* ignore */ }
  });

  it('openUrl - resolves when exec succeeds', async () => {
    const childProcess = await import('node:child_process') as any;
    (childProcess.exec as any).mockImplementationOnce((_cmd: string, _opts: any, cb: any) => {
      cb(null, 'out', 'err');
    });
    const AuthInternal = await import('../AuthInternal');
    await expect(AuthInternal.openUrl('http://example.com')).resolves.toBeUndefined();
    expect(childProcess.exec).toHaveBeenCalled();
  });

  it('openUrl - fallback to gio open when xdg-open fails (linux)', async () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'linux' });

    const childProcess = await import('node:child_process') as any;
    (childProcess.exec as any).mockImplementation((cmd: string, _opts: any, cb: any) => {
      if (cmd.includes('xdg-open')) return cb(new Error('xdg fail'), '', '');
      return cb(null, '', '');
    });

    const AuthInternal = await import('../AuthInternal');
    await expect(AuthInternal.openUrl('http://example.com')).resolves.toBeUndefined();
    expect(childProcess.exec).toHaveBeenCalled();

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('storeCachedRefreshToken - writes tmp and renames on first-write failure', async () => {
    (fsMock.writeFile as any).mockImplementationOnce(() => { throw new Error('disk full'); });
    (fsMock.writeFile as any).mockImplementationOnce(async () => {});
    (fsMock.rename as any).mockImplementationOnce(async () => {});

    const AuthInternal = await import('../AuthInternal');
    await expect(AuthInternal.storeCachedRefreshToken('  mytoken  ')).resolves.toBeUndefined();

    expect((fsMock.writeFile as any).mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(fsMock.rename).toHaveBeenCalled();
  });

  it('storeCachedRefreshToken - rethrows when both writes fail', async () => {
    (fsMock.writeFile as any).mockImplementation(() => { throw new Error('always fail'); });
    (fsMock.rename as any).mockImplementation(() => { throw new Error('rename fail'); });

    const AuthInternal = await import('../AuthInternal');
    await expect(AuthInternal.storeCachedRefreshToken('token')).rejects.toBeDefined();
  });

  it('exchangeAuthorizationCodeForTokens - succeeds on ok response', async () => {
    const mockFetch = vi.fn(async () => ({ ok: true, json: async () => ({ access_token: 'a', refresh_token: 'r' }) }));
    // @ts-ignore
    global.fetch = mockFetch;

    const AuthInternal = await import('../AuthInternal');
    const res = await AuthInternal.exchangeAuthorizationCodeForTokens({ token_endpoint: 'http://t' } as any, 'c', 'r');
    expect(res.accessToken).toBe('a');
    expect(res.refreshToken).toBe('r');
  });

  it('exchangeAuthorizationCodeForTokens - throws on non-ok response', async () => {
    const mockFetch = vi.fn(async () => ({ ok: false, status: 400, statusText: 'Bad', text: async () => 'bad details' }));
    // @ts-ignore
    global.fetch = mockFetch;

    const AuthInternal = await import('../AuthInternal');
    await expect(
      AuthInternal.exchangeAuthorizationCodeForTokens({ token_endpoint: 'http://t' } as any, 'c', 'r')
    ).rejects.toThrow(/Token exchange failed/);
  });

  it('startInteractiveAuthorization - full flow calls setTokens with exchanged tokens', async () => {
    const port = 55333;
    process.env.QBO_REDIRECT_URL = `http://127.0.0.1:${port}/cb`;
    const oauthState = 'mystate';

    // make exchange token endpoint return success
    const mockFetch = vi.fn(async () => ({ ok: true, json: async () => ({ access_token: 'AT', refresh_token: 'RT' }) }));
    // @ts-ignore
    global.fetch = mockFetch;

    const AuthInternal = await import('../AuthInternal');

    const setTokens = vi.fn(async () => {});

    const opener = async (authUrl: string) => {
      const parsed = new URL(authUrl);
      const state = parsed.searchParams.get('state');
      const redirectUrl = new URL(process.env.QBO_REDIRECT_URL!);
      redirectUrl.searchParams.set('code', 'authcode');
      if (state) redirectUrl.searchParams.set('state', state);
      await httpGetUntilReady(redirectUrl.toString());
    };

    await expect(
      AuthInternal.startInteractiveAuthorization({ authorization_endpoint: 'http://auth' } as any, oauthState, setTokens, opener)
    ).resolves.toBeUndefined();

    expect(setTokens).toHaveBeenCalledWith('AT', 'RT');
  });

  it('openUrl - rejects when both xdg-open and gio fail (linux)', async () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'linux' });
    const childProcess = await import('node:child_process') as any;
    // both attempts fail
    (childProcess.exec as any).mockImplementationOnce((cmd: string, _opts: any, cb: any) => cb(new Error('xdg fail')));
    (childProcess.exec as any).mockImplementationOnce((cmd: string, _opts: any, cb: any) => cb(new Error('gio fail')));
    const AuthInternal = await import('../AuthInternal');
    await expect(AuthInternal.openUrl('http://example.com')).rejects.toBeDefined();
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('startInteractiveAuthorization - invalid QBO_REDIRECT_URL rejects', async () => {
    process.env.QBO_REDIRECT_URL = 'not-a-url';
    const AuthInternal = await import('../AuthInternal');
    await expect(
      AuthInternal.startInteractiveAuthorization({ authorization_endpoint: 'http://auth' } as any, 's', async () => {})
    ).rejects.toThrow();
  });

  it('startInteractiveAuthorization - opener throws rejects and cleans up', async () => {
    const port = 55334;
    process.env.QBO_REDIRECT_URL = `http://127.0.0.1:${port}/cb`;
    const AuthInternal = await import('../AuthInternal');
    const opener = async () => { throw new Error('opener boom'); };
    await expect(
      AuthInternal.startInteractiveAuthorization({ authorization_endpoint: 'http://auth' } as any, 's', async () => {}, opener)
    ).rejects.toThrow(/opener boom/);
  });

  it('startInteractiveAuthorization - redirect with oauth error rejects', async () => {
    const port = 55335;
    process.env.QBO_REDIRECT_URL = `http://127.0.0.1:${port}/cb`;
    const oauthState = 's';
    const mockFetch = vi.fn(async () => ({ ok: true, json: async () => ({ access_token: 'AT', refresh_token: 'RT' }) }));
    // @ts-ignore
    global.fetch = mockFetch;
    const AuthInternal = await import('../AuthInternal');
    const opener = async (authUrl: string) => {
      const redirectUrl = new URL(process.env.QBO_REDIRECT_URL!);
      redirectUrl.searchParams.set('error', 'access_denied');
      redirectUrl.searchParams.set('error_description', 'denied');
      redirectUrl.searchParams.set('state', oauthState);
      await httpGetUntilReady(redirectUrl.toString());
    };
    await expect(
      AuthInternal.startInteractiveAuthorization({ authorization_endpoint: 'http://auth' } as any, oauthState, async () => {}, opener)
    ).rejects.toThrow(/OAuth error/);
  });

  it('startInteractiveAuthorization - missing code in redirect rejects', async () => {
    const port = 55336;
    process.env.QBO_REDIRECT_URL = `http://127.0.0.1:${port}/cb`;
    const oauthState = 's2';
    const mockFetch = vi.fn(async () => ({ ok: true, json: async () => ({ access_token: 'AT', refresh_token: 'RT' }) }));
    // @ts-ignore
    global.fetch = mockFetch;
    const AuthInternal = await import('../AuthInternal');
    const opener = async () => {
      const redirectUrl = new URL(process.env.QBO_REDIRECT_URL!);
      // no code param
      redirectUrl.searchParams.set('state', oauthState);
      await httpGetUntilReady(redirectUrl.toString());
    };
    await expect(
      AuthInternal.startInteractiveAuthorization({ authorization_endpoint: 'http://auth' } as any, oauthState, async () => {}, opener)
    ).rejects.toThrow(/Missing authorization code/);
  });

  it('startInteractiveAuthorization - invalid state rejects', async () => {
    const port = 55337;
    process.env.QBO_REDIRECT_URL = `http://127.0.0.1:${port}/cb`;
    const oauthState = 's3';
    const mockFetch = vi.fn(async () => ({ ok: true, json: async () => ({ access_token: 'AT', refresh_token: 'RT' }) }));
    // @ts-ignore
    global.fetch = mockFetch;
    const AuthInternal = await import('../AuthInternal');
    const opener = async () => {
      const redirectUrl = new URL(process.env.QBO_REDIRECT_URL!);
      redirectUrl.searchParams.set('code', 'thecode');
      redirectUrl.searchParams.set('state', 'different');
      await httpGetUntilReady(redirectUrl.toString());
    };
    await expect(
      AuthInternal.startInteractiveAuthorization({ authorization_endpoint: 'http://auth' } as any, oauthState, async () => {}, opener)
    ).rejects.toThrow(/Invalid OAuth state/);
  });
});

