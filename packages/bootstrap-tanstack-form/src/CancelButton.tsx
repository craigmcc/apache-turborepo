"use client";

/**
 * TanStack Form cancel button (for Bootstrap).
 */

// External Modules ----------------------------------------------------------

import Button from "react-bootstrap/Button";
//import clsx from "clsx";
import { useRouter } from "next/navigation";
import { ButtonHTMLAttributes } from "react";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

type Props = {
  // Optional CSS classes to apply to the button.
  className?: string,
  // Destination if the Cancel button is pressed.
  dest: string;
  // Optional label for the button.  [Cancel]
  label?: string,
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function CancelButton({ className, dest, label, ...props }: Props) {

  const router = useRouter();

  return (
    <Button
      className={className || undefined}
      onClick={(e) => {
        e.preventDefault();
        router.push(dest);
      }}
      role="button"
      type="button"
      variant="outline-secondary"
      {...props}
    >
      <span>{label ? label : "Cancel"}</span>
    </Button>
  )

}
