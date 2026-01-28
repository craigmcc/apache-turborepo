"use client";

/**
 * Input component using TanStack Form and Bootstrap.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { FieldInput } from "./FieldInput";
import { FormBase, FormControlProps } from "./FormBase";
import { useFieldContext } from "./useAppContexts";

// Public Objects ------------------------------------------------------------

export function FormInput(props: FormControlProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props}>
      <FieldInput
        aria-invalid={isInvalid}
        handleBlur={field.handleBlur}
        handleChange={field.handleChange}
        horizontal={props.horizontal}
        label={props.label}
        name={field.name}
        value={field.state.value}
      />
    </FormBase>
  )
}
