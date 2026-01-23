"use client";

/**
 * Shared infrastructure for forms based on TanStack Form (for Bootstrap).
 */

// External Modules ----------------------------------------------------------

import { createFormHook } from "@tanstack/react-form";

// Internal Modules ----------------------------------------------------------

import { CancelButton } from "./CancelButton";
import { FormCheckbox } from "./FormCheckbox";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { FormTextarea } from "./FormTextarea";
import { ResetButton } from "./ResetButton";
import { SubmitButton } from "./SubmitButton";
import { fieldContext, formContext } from "./useAppContexts";

// Public Objects ------------------------------------------------------------

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    Checkbox: FormCheckbox,
    Input : FormInput,
    Select: FormSelect,
    Textarea: FormTextarea,
  },
  fieldContext,
  formComponents: {
    CancelButton,
    ResetButton,
    SubmitButton,
  },
  formContext,
});
