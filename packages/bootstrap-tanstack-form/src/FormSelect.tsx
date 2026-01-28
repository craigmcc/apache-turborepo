"use client";

/**
 * Select component using TanStack Form and Bootstrap.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { FieldSelect } from "./FieldSelect";
import { FormBase, FormControlProps } from "./FormBase";
import { useFieldContext } from "./useAppContexts";

// Public Objects ------------------------------------------------------------

export type FormSelectOption = {
  label: string;
  value?: string; // No value for a placeholder
}

export type FormSelectProps = FormControlProps & {
  options: FormSelectOption[];
};

export function FormSelect({
  options,
  ...props
}: FormSelectProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props}>
      <FieldSelect
        aria-invalid={isInvalid}
        handleBlur={field.handleBlur}
        handleChange={field.handleChange}
        horizontal={props.horizontal}
        label={props.label}
        name={field.name}
        options={options}
        value={field.state.value}
      />
    </FormBase>
  )
}
