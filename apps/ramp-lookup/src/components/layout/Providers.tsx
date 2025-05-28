"use client";

/**
 * Convenience wrapper for all providers used in the app.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { SelectedDepartmentContextProvider } from "@/contexts/SelectedDepartmentContext";

// Public Objects ------------------------------------------------------------

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SelectedDepartmentContextProvider>
      {children}
    </SelectedDepartmentContextProvider>
  );
}
