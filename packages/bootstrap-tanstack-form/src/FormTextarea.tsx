"use client";

/**
 * Textarea component using Tanstack Form and Shadcn UI.
 */

// External Modules ----------------------------------------------------------

import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

import { FormBase, FormControlProps } from "./FormBase";
import { useFieldContext } from "./useAppContexts";

// Public Objects ------------------------------------------------------------

export function FormTextarea(props: FormControlProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props}>
      <Form.Control
        aria-invalid={isInvalid}
        as="textarea"
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.value)}
        value={field.state.value}
      />
    </FormBase>
  )
}
