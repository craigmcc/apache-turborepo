"use client";

/**
 * A component similar to FormCheckbox, but without the Tanstack Form dependencies,
 * for use in standalone checkboxes.
 */

// External Modules ----------------------------------------------------------

import { ChangeEvent } from "react";
import { Form } from "react-bootstrap";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export type FieldCheckboxProps = {
  // Optional CSS classes to apply to the checkbox field.
  className?: string,
  // Optional handler for blur events
  handleBlur?: () => void,
  // Handler for value change events.
  handleChange: (newValue: boolean) => void,
  // Visual label for this field.
  label: string,
  // Checkbox field name. (also used as id)
  name: string,
  // Current checkbox field value
  value: boolean,
};

export function FieldCheckbox({
  className,
  handleBlur,
  handleChange,
  label,
  name,
  value,
  ...props
}: FieldCheckboxProps) {

  return (
    <Form.Group className={className} controlId={name}>
      <Form.Check
        checked={value}
        id={name}
        label={label}
        name={name}
        onBlur={handleBlur}
        onChange={(e) => handleChange(e.target.checked)}
        type="checkbox"
        {...props}
      />
    </Form.Group>
  );
}
