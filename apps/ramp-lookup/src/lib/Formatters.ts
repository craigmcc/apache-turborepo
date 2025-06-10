/**
 * Formatters for RAMP amounts that include both the value and the currency.
 */

// Public Objects ------------------------------------------------------------

/*
export function formatRampAmount(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`;
}
*/

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
