/**
 * Formatters for RAMP amounts that include both the value and the currency.
 */

// Internal Imports ----------------------------------------------------------

import { Timestamps } from "@repo/shared-utils/Timestamps";
import {
  CardPlus,
  DepartmentPlus,
  LimitPlus,
  TransactionPlus,
  UserPlus
} from "@/types/types";

// Public Objects ------------------------------------------------------------

/**
 * Format the accounting date for a transaction.
 *
 * @param transaction Transaction object
 */
export function formatAccountingDate(transaction: TransactionPlus): string {
  if (transaction.accounting_date) {
    const accountingDate = new Date(transaction.accounting_date!);
    return Timestamps.local(accountingDate);
  } else {
    return "n/a";
  }
}

/**
 * Format a RAMP amount with its currency code.
 *
 * @param amt Amount in the lowest denomination (e.g., cents for USD)
 * @param cc  Currency code (e.g., "USD")
 */
export function formatAmount(amt: number | null | undefined, cc: string | null | undefined): string {
  let formatted = cc ? `${cc} ` : "";
  // TODO - make this sensitive to the currency's decimal places
  if (amt) {
    formatted += `${(amt/100).toFixed(2)}`;
  } else {
    formatted += "n/a";
  }
  return formatted;
}

/**
 * Format a RAMP card name.
 *
 * @param card Card object
 */
export function formatCardName(card: CardPlus | null | undefined): string {
  return card?.display_name || "n/a";
}

/**
 * Format a RAMP card interval.
 *
 * @param card Card object
 */
export function formatCardInterval(card: CardPlus | null | undefined): string {
  return card?.spending_restrictions?.interval || "n/a";
}

/**
 * Format a RAMP card state.
 *
 * @param card Card object
 */
export function formatCardState(card: CardPlus | null | undefined): string {
  return card?.state || "n/a";
}

/**
 * Format a RAMP department name.
 *
 * @param department Department object
 */
export function formatDepartmentName(department: DepartmentPlus | null | undefined): string {
  return department?.name || "n/a";
}

/**
 * Format the GL Account Number and Name for a transaction.
 *
 * @param transaction Transaction object
 * @param index Index of the line item accounting field selection to use (default: 0)
 */
export function formatGlAccount(transaction: TransactionPlus, index=0): string {
  // IMPLEMENTATION NOTES:
  //   * This assumes that the first accounting field selection is always the GL_ACCOUNT type.
  //   * It assumes that no other line items will be paid attention to.
  //   * With our current Ramp setup, the data matches these assumptions.
  const tliafs = transaction.line_item_accounting_field_selections;
  if (tliafs && (tliafs.length > 0) && (tliafs[index].category_info_type === "GL_ACCOUNT")) {
    return `${tliafs[index].external_code} - ${tliafs[index].name}`;
  } else {
    return "n/a";
  }
}

/**
 * Format a RAMP limit interval.
 *
 * @param limit Limit object
 */
export function formatLimitInterval(limit: LimitPlus | null | undefined): string {
  return limit?.spending_restrictions?.interval || "n/a";
}

/**
 * Format a RAMP limit name.
 *
 * @param limit Limit object
 */
export function formatLimitName(limit: LimitPlus | null | undefined): string {
  return limit?.display_name || "n/a";
}

/**
 * Format a RAMP limit state.
 *
 * @param limit Limit object
 */
export function formatLimitState(limit: LimitPlus | null | undefined): string {
  return limit?.state || "n/a";
}

/**
 * Format the merchant name for a transaction.
 *
 * @param transaction Transaction object
 */
export function formatMerchantName(transaction: TransactionPlus): string {
  return transaction.merchant_name || "n/a";
}

/**
 * Format a RAMP transaction state.
 *
 * @param transaction Transaction object
 */
export function formatTransactionState(transaction: TransactionPlus | null | undefined): string {
  return transaction?.state || "n/a";
}

/**
 * Format a RAMP user name.
 *
 * @param user User object
 */
export function formatUserName(user: UserPlus | null | undefined): string {
  if (user && user.first_name && user.last_name) {
    return `${user.last_name}, ${user.first_name}`;
  } else {
    return "n/a";
  }
}

/**
 * Format a RAMP user state.
 *
 * @param user User object
 */
export function formatUserStatus(user: UserPlus | null | undefined): string {
  return user?.status || "n/a";
}

// Private Objects -----------------------------------------------------------

/**
 * Table of currencies (with their ISO codes) to the number of decimal places they use.
 * TODO: THIS NEEDS TO BE VERIFIED WITH RAMP!
 * Current values based on https://github.com/datasets/currency-codes/blob/main/data/codes-all.csv
 */
/*
  const currencyDecimalPlaces: Record<string, number> = {
    AUD: 2, // Australian Dollar
    BRL: 2, // Brazilian Real
    CAD: 2, // Canadian Dollar
    CNY: 2, // Chinese Yuan Renminbi
    DKK: 2, // Danish Krone
    EUR: 2, // European Union Euro
    GPB: 2, // British Pound Sterling
    INR: 1, // Indian Rupee
    JPY: 0, // Japanese Yen
    USD: 2, // United States Dollar
    SEK: 2, // Swedish Króna
    TRY: 2, // Turkish Lira
    TWD: 2, // New Taiwan Dollar
    ZAR: 2, // South African Rand
  };
*/
