"use client";

/**
 * TanStack Form field error messages component (for Boostrap).
 */

// External Modules ----------------------------------------------------------

import { AnyFieldApi } from "@tanstack/react-form";
import Alert from "react-bootstrap/Alert";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

type Props = {
  // The field API for which to display errors.
  field: AnyFieldApi;
}

export function FieldErrors({ field }: Props) {
  return (
    <>
    {!field.state.meta.isPristine && field.state.meta.errors && (
      <Alert variant="danger">
        {field.state.meta.errors.map((e => e.message)).join(', ')}
      </Alert>
      )}
    </>
  )
}
