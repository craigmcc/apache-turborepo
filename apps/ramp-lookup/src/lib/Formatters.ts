/**
 * Formatters for RAMP amounts that include both the value and the currency.
 */

// Internal Imports ----------------------------------------------------------

import { CardPlus, DepartmentPlus, UserPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

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
 * Format a RAMP user name.
 *
 * @param user User object
 */
export function formatUserName(user: UserPlus | null | undefined): string {
  if (user && user.first_name && user.last_name) {;
    return `${user.last_name}, ${user.first_name}`;
  } else {
    return "n/a";
  }
}

// Private Objects -----------------------------------------------------------

/**
 * Table of currencies (with their ISO codes) to the number of decimal places they use.
 * TODO: THIS NEEDS TO BE VERIFIED WITH RAMP!
 * Current values based on https://github.com/datasets/currency-codes/blob/main/data/codes-all.csv
 */
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
