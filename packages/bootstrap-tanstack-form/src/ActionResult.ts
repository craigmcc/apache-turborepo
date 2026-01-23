/**
 * The result of an action that may return a value or an error (or both).
 */

// External Modules ----------------------------------------------------------

import { z, ZodError } from "zod";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

/**
 * Default error messages for common problems.
 */
export const ERRORS = {
  AUTHENTICATION: "This Profile is not signed in",
  DATA_VALIDATION: "Request data does not pass validation",
  ID_VALIDATION: "Specified ID does not pass validation",
  INTERNAL_SERVER_ERROR: "Internal Server Error occurred",
  NOT_ADMIN: "This Profile is not an Admin of the owning List",
  NOT_MEMBER: "This Profile is not a Member of the owning List",
};

/**
 * The result of an action that may return an error message or a model object
 * (or both).  For cases where the action failed because of schema validation
 * issues, a set of form errors (individual strings) global to the entire
 * result, and/or a set of field errors (keyed by field name) specific to
 * this model object are returned.
 *
 * @param M                             The type of model object being returned
 */
export type ActionResult<M> = {
  // Field errors (if any) keyed by field name (based on ZodError flattened)
  fieldErrors?: {
    [p: string]: string[] | undefined;
    [p: number]: string[] | undefined;
    [p: symbol]: string[] | undefined
  } | undefined;
  // Form errors (if any) global to the entire result (based on ZodError flattened
  formErrors?: string[] | undefined;
  // Message describing the error that occurred (if any)
  message?: string | undefined;
  // The model object returned by the action (if any)
  model?: M | undefined;
}

/**
 * Shortcut for an ActionResult that returns validation errors.
 *
 * @param M                             The type of model object being returned
 * @param error                         The ZodError that caused the failure
 * @param message                       Optional message to include in the result
 */
export function ValidationActionResult<M>(error: ZodError, message?: string): ActionResult<M> {
  const flattened = error.flatten();
  return {
    fieldErrors: flattened.fieldErrors || undefined,
    formErrors: flattened.formErrors || undefined,
    message: message ? message : ERRORS.DATA_VALIDATION,
  }
}
