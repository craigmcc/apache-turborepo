"use client";

/**
 * Convenience wrapper for all providers used in the app.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { SelectedCardContextProvider } from "@/contexts/SelectedCardContext";
import { SelectedDepartmentContextProvider } from "@/contexts/SelectedDepartmentContext";
import { SelectedUserContextProvider } from "@/contexts/SelectedUserContext";

// Public Objects ------------------------------------------------------------

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SelectedDepartmentContextProvider>
      <SelectedUserContextProvider>
        <SelectedCardContextProvider>
          {children}
        </SelectedCardContextProvider>
      </SelectedUserContextProvider>
    </SelectedDepartmentContextProvider>
  );
}
