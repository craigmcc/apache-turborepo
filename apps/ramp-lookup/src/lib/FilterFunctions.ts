/**
 * Generic filter functions for Tanstack Table
 */

// External Modules ----------------------------------------------------------

import { FilterFn } from "@tanstack/react-table";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export const greaterThanOrEqualTo: FilterFn<string> = (row, columnId, value) => {
  if (!value || (value === "")) {
    return true; // If no value is provided, do not filter out any rows
  } else {
    const cellValue  = String(row.getValue(columnId));
    return cellValue >= value;
  }
}

export const lessThanOrEqualTo: FilterFn<string> = (row, columnId, value) => {
  if (!value || (value === "")) {
    return true; // If no value is provided, do not filter out any rows
  } else {
    const cellValue = String(row.getValue(columnId));
    return cellValue <= value;
  }
}
