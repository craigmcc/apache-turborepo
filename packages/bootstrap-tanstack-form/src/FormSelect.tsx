"use client";

/**
 * Select component using TanStack Form and Bootstrap.
 */

// External Modules ----------------------------------------------------------

import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

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
      <Form.Select
        aria-invalid={isInvalid}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.value)}
        value={field.state.value}
      >
        {options.map((option, index) => (
          <option
            key={index}
            value={option.value ? option.value : undefined}
          >
            {option.label}
          </option>
        ))}
      </Form.Select>
    </FormBase>
  )
}
