"use client";

/**
 * Generic form control wrapper component (for Bootstrap).
 *
 * The child of this component is expected to be a form component that
 * uses Tanstack Form APIs and accepts properties listed in FormControlProps.
 */

// External Modules ----------------------------------------------------------

import { ReactNode } from "react";
import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

import { FieldErrors } from "./FieldErrors";
import { useFieldContext } from "./useAppContexts";

// Public Objects ------------------------------------------------------------

export type FormControlProps = {
  // If horizontal layout is requested, the number of Bootstrap grid columns
  // (out of twelve) to allocate to the label (the rest goes to the input).
  // If not specified, a vertical layout is used.
  horizontal?: number
  // Visual label for this form control
  label: string
  // Optional description for this form control
  description?: string
}

type FormBaseProps = FormControlProps & {
  children: ReactNode
  controlFirst?: boolean
}

export function FormBase({
  children,
}: FormBaseProps) {

  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const errorElem = isInvalid &&
    <Form.Control.Feedback type="invalid">
      <FieldErrors field={field}/>
    </Form.Control.Feedback>

  return (
    <Form.Group data-invalid={isInvalid}>
      {children}
      {errorElem}
    </Form.Group>
  )
}
