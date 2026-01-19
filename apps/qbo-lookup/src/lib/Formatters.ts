/**
 * Formatters for QBO values.
 */

// External Imports ----------------------------------------------------------

import { JournalEntryLine } from "@repo/qbo-db/client";

// Internal Imports ----------------------------------------------------------

import { AccountPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

/**
 * Format an Account number and name
 */
export function formatAccountNumberAndName(account: AccountPlus | null | undefined): string {
  if (account && account.acctNum && account.name) {
    return `${account.acctNum} - ${account.name}`;
  } else if (account && account.acctNum) {
    return `${account.acctNum} - n/a`;
  } else if (account && account.name) {
    return `n/a - ${account.name}`;
  } else {
    return "n/a";
  }
}

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
 * Format a Journal Entry Line amount.
 */
export function formatJournalEntryLineAmount(line: JournalEntryLine | null | undefined): string {
  if (!line || !line.amount) {
    return "n/a";
  }
  let amount = line.amount;
  if (line.postingType === "Credit") {
    amount = -amount;
  }

  return amount.toString();
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

