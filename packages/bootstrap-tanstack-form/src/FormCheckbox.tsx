"use client";

/**
 * Checkbox component using TanStack Form and Bootstrap.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { FieldCheckbox } from "./FieldCheckbox";
import { FormBase, FormControlProps } from "./FormBase";
import { useFieldContext } from "./useAppContexts";

// Public Objects ------------------------------------------------------------

export function FormCheckbox(props: FormControlProps) {
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props}>
      <FieldCheckbox
        aria-invalid={isInvalid}
        handleBlur={field.handleBlur}
        handleChange={field.handleChange}
        label={props.label}
        name={field.name}
        value={field.state.value}
      />
    </FormBase>
  )
}
