/**
 * Formatters for QBO values.
 */

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

/**
 * Format an optional boolean value.
 */
export function formatBoolean(value: boolean | null | undefined): string {
  if (value === true) {
    return "true";
  } else if (value === false) {
    return "false";
  } else {
    return "n/a";
  }
}

/**
 * Format a length limited string.
 */
export function formatString(value: string | null | undefined, maxLength: number = 50): string {
  if (!value) {
    return "n/a";
  }
  if (value.length <= maxLength) {
    return value;
  }
  return value.substring(0, maxLength) + "...";
}

