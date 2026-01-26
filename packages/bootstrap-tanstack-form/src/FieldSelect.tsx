"use client";

/**
 * A component similar to FormCheckbox, but without the Tanstack Form dependencies,
 * for use in standalone checkboxes.
 * TODO: Implement "horizontal" like FormBase when implemented there.
 */

// External Modules ----------------------------------------------------------

import { InputHTMLAttributes } from "react";
import { Col, Form, Row } from "react-bootstrap";

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
  // Horizontal layout? [false]
  horizontal?: boolean,
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
  horizontal,
  label,
  name,
  options,
  value,
  ...props
}: FieldSelectProps) {

  if (horizontal) {
    return (
      <Form.Group as={Row} className={className} controlId={name}>
        <Form.Label column sm={4}>{label}</Form.Label>
        <Col sm={8}>
          <Form.Select
            name={name}
            onBlur={handleBlur}
            onChange={e => handleChange(e.target.value)}
            size="sm"
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
        </Col>
      </Form.Group>
    );
  }

  return (
    <Form.Group className={className} controlId={name}>
      <Form.Label>{label}</Form.Label>
      <Form.Select
        id={name}
        name={name}
        onBlur={handleBlur}
        onChange={e => handleChange(e.target.value)}
        size="sm"
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
