// TypeScript
import type { NextConfig } from "next";

const QBO_API_PACKAGE_NAMES = [
  "qbo-api",
  "@repo/qbo-api",
];

const nextConfig: NextConfig = {
  // keep your other Next config options here
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // Treat the server-only package as an external so it won't be bundled for the browser.
      config.externals = config.externals || [];
      config.externals.push(
        (
          context: Record<string, unknown>,
          request: string | undefined,
          callback: (err?: Error | null, result?: string | false) => void
        ) => {
          if (!request) return callback();
          for (const pkgName of QBO_API_PACKAGE_NAMES) {
            if (request === pkgName || request.startsWith(pkgName + "/")) {
              return callback(null, "commonjs " + request);
            }
          }
          return callback();
        }
      );

      // Prevent webpack from polyfilling Node built-ins.
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        child_process: false,
        crypto: false,
        path: false,
        os: false,
      };

      // Map both the plain and the `node:` specifier forms to false so webpack won't try to resolve them.
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        fs: false,
        "node:fs": false,
        child_process: false,
        "node:child_process": false,
        crypto: false,
        "node:crypto": false,
        path: false,
        "node:path": false,
        os: false,
        "node:os": false,
      };
    }

    return config;
  },
};

export default nextConfig;
