"use client";

/**
 * Convenience wrapper for all providers used in the app.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { AccessTokenContextProvider } from "@/contexts/AccessTokenContext";

// Public Objects ------------------------------------------------------------

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AccessTokenContextProvider>
      {children}
    </AccessTokenContextProvider>
  );
}
