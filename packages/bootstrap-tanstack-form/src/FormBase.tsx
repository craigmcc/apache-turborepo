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
  // Visual label for this form control
  label: string
  // Optional description for this form control
  description?: string
}

type FormBaseProps = FormControlProps & {
  children: ReactNode
  horizontal?: boolean // TODO - not yet implemented
  controlFirst?: boolean
}

export function FormBase({
  children,
  label,
  description,
  controlFirst,
//  horizontal, // TODO - not yet implemented
}: FormBaseProps) {

  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const labelElement = (
    <>
      <Form.Label htmlFor={field.name}>{label}</Form.Label>
      {description && <Form.Text className="text-muted">{description}</Form.Text>}
    </>
  )
  const errorElem = isInvalid &&
    <Form.Control.Feedback type="invalid">
      <FieldErrors field={field}/>
    </Form.Control.Feedback>

  return (
    <Form.Group
      data-invalid={isInvalid}
//      orientation={horizontal ? "horizontal" : undefined}
    >
      {controlFirst ? (
        <>
          {children}
          {labelElement}
          {errorElem}
        </>
      ) : (
        <>
          {labelElement}
          {children}
          {errorElem}
        </>
      )}
    </Form.Group>
  )
}
