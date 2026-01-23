"use client";

/**
 * TanStack Form submit button (for Bootstrap).
 */

// External Modules ----------------------------------------------------------

import Button from "react-bootstrap/Button";
//import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

// Internal Modules ----------------------------------------------------------

import { useFormContext } from "./useAppContexts";

// Public Objects ------------------------------------------------------------

type Props = {
  // Optional CSS classes to apply to the button.
  className?: string,
  // Optional label for the button.  [Save]
  label?: string,
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function SubmitButton({ className, label, ...props }: Props) {

  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) =>
        [state.canSubmit, state.isSubmitting]}
    >
      {([canSubmit, isSubmitting]) => (
        <Button
          className={className || undefined}
          disabled={!canSubmit || isSubmitting}
          role="button"
          type="submit"
          {...props}
        >
           <span>{label ? label : "Save"}</span>
        </Button>
      )}
    </form.Subscribe>
  )

}
