"use client";

/**
 * Display any error contents from a Result.
 * - If the result is null, return null (action was deemed successful).
 * - If the result contains a model, return null (action was deemed successful).
 * - If the result contains a message, display it in an error style.
 * - If the result also contains fieldErrors and/or formErrors, display
 *   them in a suitable list format underneath the message.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { Result } from "@repo/shared-utils/Result";

// Public Objects ------------------------------------------------------------

type Props<M> = {
  result?: Result<M> | null;
}

export function ServerResult<M>({ result }: Props<M>) {

  if (!result || result.model) {
    return null; // Result of a successful action
  }
  if (!result.message) {
    return null; // Result really should have had model or message.
  }

  return (
    <>
    <div className="bg-destructive text-destructive-content px-2 py-2 border border-2 rounded">
      <div>{result.message}</div>
      <ul>
        {result.formErrors?.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
      {result.fieldErrors && (
        <ul>
          {Object.entries(result.fieldErrors).map(([field, errors]) => {
              return (
                errors && (
                  <li key={field}>
                    {field}: {errors.join(", ")}
                  </li>
                )
              )
            }
          )}
        </ul>
      )}
    </div>
    <p>&nbsp;</p>
    </>
  );

}
