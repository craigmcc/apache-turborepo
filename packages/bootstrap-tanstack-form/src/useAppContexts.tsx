"use client";

/**
 * Contexts and hooks for TanStack Form fields and forms (for Bootstrap).
 */

// External Modules ----------------------------------------------------------

import { createFormHookContexts } from "@tanstack/react-form";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

/**
 * Export useFieldContext and related objects for use in custom components.
 */

export const { fieldContext, formContext, useFieldContext, useFormContext }
  = createFormHookContexts();
