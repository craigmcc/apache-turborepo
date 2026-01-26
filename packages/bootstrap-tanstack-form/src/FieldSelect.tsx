"use client";

/**
 * A component similar to FormCheckbox, but without the Tanstack Form dependencies,
 * for use in standalone checkboxes.
 * TODO: Implement "horizontal" like FormBase when implemented there.
 */

// External Modules ----------------------------------------------------------

import { InputHTMLAttributes } from "react";
import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export type FieldSelectOption = {
  label: string;
  value?: string; // No value for a placeholder
}

export type FieldSelectProps = {
  // Optional CSS classes to apply to the select field.
  className?: string,
  // Optional handler for blur events
  handleBlur?: () => void,
  // Handler for value change events.
  handleChange: (newValue: string) => void,
  // Visual label for this field.
  label: string,
  // Select options
  options: FieldSelectOption[],
  // Select field name. (also used as id)
  name: string,
  // Size (not used because it conflicts with InputHTMLAttributes.size)
  size?: "sm" | "md" | "lg",
  // Current select field value
  value: string,
} & InputHTMLAttributes<HTMLSelectElement>;

export function FieldSelect({
  className,
  handleBlur,
  handleChange,
  label,
  name,
  options,
  value,
  ...props
}: FieldSelectProps) {
  return (
    <Form.Group className={className} controlId={name}>
      <Form.Label>{label}</Form.Label>
      <Form.Select
        id={name}
        name={name}
        onBlur={handleBlur}
        onChange={e => handleChange(e.target.value)}
        value={value}
        {...props}
      >
        {options.map((option, index) => (
          <option
            disabled={!option.value}
            key={index}
            value={option.value ? option.value : undefined}
          >
            {option.label}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
}
