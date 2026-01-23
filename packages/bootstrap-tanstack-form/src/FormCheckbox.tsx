/**
 * Checkbox component using TanStack Form and Shadcn UI.
 */

// External Modules ----------------------------------------------------------

import Form from "react-bootstrap/Form";


// Internal Modules ----------------------------------------------------------

import { FormBase, FormControlProps } from "./FormBase";
import { useFieldContext } from "./useAppContexts";

// Public Objects ------------------------------------------------------------

export function FormCheckbox(props: FormControlProps) {
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props} controlFirst horizontal>
      <Form.Check
        aria-invalid={isInvalid}
        checked={field.state.value}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.checked)}
      />
    </FormBase>
  )
}
