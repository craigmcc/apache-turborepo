"use client";

/**
 * Generic text field filter component.
 */

// External Imports ----------------------------------------------------------

import Form from "react-bootstrap/Form";

// Public Objects ------------------------------------------------------------

export type TextFieldFilterProps = {
  // Optional controlID for the filter [textFieldFilter]
  controlId?: string;
  // Optional label for the filter [Filter by Text: ]
  label?: string;
  // Optional placeholder for the text field [none]
  placeholder?: string;
  // Change the currently selected text filter value
  setTextFieldFilter: (value: string) => void;
  // The current value of the text field filter
  textFieldFilter: string;
}

export function TextFieldFilter({
  controlId = "textFieldFilter",
  label = "Filter by Text:",
  placeholder,
  setTextFieldFilter,
  textFieldFilter,
}: TextFieldFilterProps) {
  return (
    <Form.Group controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        onChange={(e) =>
          setTextFieldFilter(e.target.value)}
        placeholder={placeholder || undefined}
        size="sm"
        type="text"
        value={textFieldFilter}
      />
    </Form.Group>
  );
}
