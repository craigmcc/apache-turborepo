"use client";

/**
 * Convenience wrapper for all providers used in the app.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { AccessTokenContextProvider } from "@/contexts/AccessTokenContext";
import { SelectedUserContextProvider } from "@/contexts/SelectedUserContext";

// Public Objects ------------------------------------------------------------

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SelectedUserContextProvider>
      <AccessTokenContextProvider>
        {children}
      </AccessTokenContextProvider>
    </SelectedUserContextProvider>
  );
}
