"use client";

/**
 * An input textarea component, that can be used without the Tanstack Form
 * requirements of FormTextarea. */

// External Modules ----------------------------------------------------------

import { InputHTMLAttributes } from "react";
import { Col, Form, Row } from "react-bootstrap";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export type FieldTextareaProps = {
  // Optional CSS classes to apply to the textarea field.
  className?: string,
  // Optional handler for blur events
  handleBlur?: () => void,
  // Handler for value change events.
  handleChange: (newValue: string) => void,
  // If horizontal layout is requested, the number of Bootstrap grid columns
  // (out of twelve) to allocate to the label (the rest goes to the input).
  // If not specified, a vertical layout is used.
  horizontal?: number,
  // Is this field value invalid? [false]
  isInvalid?: boolean,
  // Visual label for this field.
  label: string,
  // Input field name. (also used as id)
  name: string,
  /// Number of rows for the textarea [3]
  rows?: number,
  // Size (not used because it conflicts with InputHTMLAttributes.size)
  size?: "sm" | "md" | "lg",
  // Input field type.  [text]
  type?: string,
  // Current input field value
  value: string,
} & InputHTMLAttributes<HTMLInputElement>;

export function FieldTextarea({
                                className,
                                handleBlur,
                                handleChange,
                                horizontal,
                                isInvalid = false,
                                label,
                                name,
                                rows = 3,
                                type = "text",
                                value,
                                ...props
                              }: FieldTextareaProps) {

  if (horizontal && horizontal > 0 && horizontal < 12) {
    const groupClass = className ? `${className} align-items-center` : "align-items-center";
    return (
      <Form.Group as={Row} className={groupClass} controlId={name}>
        <Form.Label className="mb-0" column sm={horizontal}>{label}</Form.Label>
        <Col sm={12 - horizontal}>
          <Form.Control
            aria-invalid={isInvalid}
            as="textarea"
            name={name}
            onBlur={handleBlur}
            onChange={(e) => handleChange(e.target.value)}
            rows={rows}
            size="sm"
//            type={type}
            value={value}
            {...props}
          />
        </Col>
      </Form.Group>
    );
  }

  return (
    <Form.Group controlId={name}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        aria-invalid={isInvalid}
        as="textarea"
        className={className}
        name={name}
        onBlur={handleBlur}
        onChange={(e) => handleChange(e.target.value)}
        rows={rows}
        size="sm"
        type={type}
        value={value}
        {...props}
      />
    </Form.Group>
  );

}
