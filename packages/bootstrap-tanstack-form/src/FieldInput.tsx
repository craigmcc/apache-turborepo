"use client";

/**
 * A component similar to FormInput, but without the Tanstack Form dependencies,
 * for use in standalone inputs such as a search box.
 * TODO: Implement "horizontal" like FormBase when implemented there.
 */

// External Modules ----------------------------------------------------------

import { InputHTMLAttributes } from "react";
import { Col, Form, Row } from "react-bootstrap";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export type FieldInputProps = {
  // Optional CSS classes to apply to the input field.
  className?: string,
  // Optional handler for blur events
  handleBlur?: () => void,
  // Handler for value change events.
  handleChange: (newValue: string) => void,
  // Horizontal layout? [false]
  horizontal?: boolean,
  // Visual label for this field.
  label: string,
  // Input field name. (also used as id)
  name: string,
  // Size (not used because it conflicts with InputHTMLAttributes.size)
  size?: "sm" | "md" | "lg",
  // Input field type.  [text]
  type?: string,
  // Current input field value
  value: string,
} & InputHTMLAttributes<HTMLInputElement>;

export function FieldInput({
                             className,
                             handleBlur,
                             handleChange,
                             horizontal,
                             label,
                             name,
                             type = "text",
                             value,
                             ...props
                           }: FieldInputProps) {

  if (horizontal) {
    return (
      <Form.Group as={Row} className={className} controlId={name}>
        <Form.Label column sm={4}>{label}</Form.Label>
        <Col sm={8}>
          <Form.Control
            name={name}
            onBlur={handleBlur}
            onChange={(e) => handleChange(e.target.value)}
            size="sm"
            type={type}
            value={value}
            {...props}
          />
        </Col>
      </Form.Group>
    );
  }

  return (
    <Form.Group className={className} controlId={name}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        name={name}
        onBlur={handleBlur}
        onChange={(e) => handleChange(e.target.value)}
        size="sm"
        type={type}
        value={value}
        {...props}
      />
    </Form.Group>
  );

}
