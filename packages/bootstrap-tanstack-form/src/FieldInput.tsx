"use client";

/**
 * A component similar to FormInput, but without the Tanstack Form dependencies,
 * for use in standalone inputs such as a search box.
 * TODO: Implement "horizontal" like FormBase when implemented there.
 */

// External Modules ----------------------------------------------------------

import { InputHTMLAttributes } from "react";
import { Form } from "react-bootstrap";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export type FieldInputProps = {
  // Optional CSS classes to apply to the input field.
  className?: string,
  // Visual label for this field.
  label: string,
  // Input field name. (also used as id)
  name: string,
  // Optional handler for blur events
  onBlur?: () => void,
  // Handler for value change events.
  onChange: (newValue: string) => void,
  // Size (not used because it conflicts with InputHTMLAttributes.size)
  size?: "sm" | "md" | "lg",
  // Input field type.  [text]
  type?: string,
  // Current input field value
  value: string,
} & InputHTMLAttributes<HTMLInputElement>;

export function FieldInput({
  className,
  label,
  name,
  onBlur,
  onChange,
  type = "text",
  value,
  ...props
}: FieldInputProps) {

  return (
    <Form.Group className={className} controlId={name}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        id={name}
        name={name}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        size="sm"
        type={type}
        value={value}
        {...props}
      />
    </Form.Group>
  );

}
