import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock child_process, fs, and express before importing the module under test
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

// Mock express to capture the registered handler so tests can call it directly
vi.mock('express', () => {
  const last: { path?: string; handler?: any } = {};
  function createApp() {
    return {
      get: (p: string, h: any) => { last.path = p; last.handler = h; },
      listen: (port: number, cb?: () => void) => { setImmediate(cb); return { close: () => {} }; },
    };
  }
  return {
    __last: last,
    default: createApp,
  };
});

import { promises as fsMock } from 'fs';

describe('AuthInternal', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    process.env.QBO_ENVIRONMENT = 'test';
    process.env.QBO_CLIENT_ID = 'cid';
    process.env.QBO_CLIENT_SECRET = 'csecret';
  });

  afterEach(() => {
    delete process.env.QBO_REDIRECT_URL;
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

  it('startInteractiveAuthorization - full flow calls setTokens with exchanged tokens', async () => {
    const port = 55333;
    process.env.QBO_REDIRECT_URL = `http://127.0.0.1:${port}/cb`;
    const oauthState = 'mystate';

    const mockFetch = vi.fn(async () => ({ ok: true, json: async () => ({ access_token: 'AT', refresh_token: 'RT' }) }));
    // @ts-ignore
    global.fetch = mockFetch;

    const AuthInternal = await import('../AuthInternal');
    const expressMock = await import('express') as any;

    const setTokens = vi.fn(async () => {});

    const opener = async (authUrl: string) => {
      // Call the handler that startInteractiveAuthorization registered
      const handler = expressMock.__last.handler;
      const fakeReq = { query: { code: 'authcode', state: oauthState } };
      const fakeRes = { status: (_: number) => ({ send: (_: string) => {} }), send: (_: string) => {} };
      await handler(fakeReq, fakeRes);
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
    const expressMock = await import('express') as any;

    const opener = async (authUrl: string) => {
      const handler = expressMock.__last.handler;
      const fakeReq = { query: { error: 'access_denied', error_description: 'denied', state: oauthState } };
      const fakeRes = { status: (_: number) => ({ send: (_: string) => {} }), send: (_: string) => {} };
      await handler(fakeReq, fakeRes);
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
    const expressMock = await import('express') as any;
    const opener = async () => {
      const handler = expressMock.__last.handler;
      const fakeReq = { query: { state: oauthState } };
      const fakeRes = { status: (_: number) => ({ send: (_: string) => {} }), send: (_: string) => {} };
      await handler(fakeReq, fakeRes);
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
    const expressMock = await import('express') as any;
    const opener = async () => {
      const handler = expressMock.__last.handler;
      const fakeReq = { query: { code: 'thecode', state: 'different' } };
      const fakeRes = { status: (_: number) => ({ send: (_: string) => {} }), send: (_: string) => {} };
      await handler(fakeReq, fakeRes);
    };
    await expect(
      AuthInternal.startInteractiveAuthorization({ authorization_endpoint: 'http://auth' } as any, oauthState, async () => {}, opener)
    ).rejects.toThrow(/Invalid OAuth state/);
  });
});

