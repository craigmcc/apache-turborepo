"use client";

/**
 * Textarea component using Tanstack Form and Bootstrap.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { FieldTextarea } from "./FieldTextarea";
import { FormBase, FormControlProps } from "./FormBase";
import { useFieldContext } from "./useAppContexts";

// Public Objects ------------------------------------------------------------

type FormTextareaProps = FormControlProps & {
  rows?: number
};

export function FormTextarea(props: FormTextareaProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props}>
      <FieldTextarea
        aria-invalid={isInvalid}
        name={field.name}
        handleBlur={field.handleBlur}
        handleChange={newValue => field.handleChange(newValue)}
        value={field.state.value}
        {...props}
      />
    </FormBase>
  )
}
