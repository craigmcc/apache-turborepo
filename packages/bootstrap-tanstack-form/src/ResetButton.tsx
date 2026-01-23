"use client";

/**
 * TanStack Form reset button (for Bootstrap).
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
  // Optional label for the button.  [Reset]
  label?: string,
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ResetButton({ className, label, ...props }: Props) {

  const form = useFormContext();

  return (
    <Button
      className={className || undefined}
      onClick={(e) => {
        e.preventDefault();
        form.reset();
      }}
      role="button"
      type="button"
      variant="danger"
      {...props}
    >
      <span>{label ? label : "Reset"}</span>
    </Button>
  )

}
