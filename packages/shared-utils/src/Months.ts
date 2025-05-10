/**
 * Convenience functions that perform useful calculations with months that are
 * represented as strings (YYYY-MM).
 */

// External Modules ----------------------------------------------------------

import { addMonths, endOfMonth, startOfMonth, subMonths } from "date-fns";

// Internal Modules ----------------------------------------------------------

import { Dates } from "./Dates";

// Public Objects ------------------------------------------------------------

export const Months = {
  /**
   * Return the specified month minus the specified decrement (in months).
   *
   * @param {string} value            Original month
   * @param {number} decrement        Number of months to decrement
   * @return {string}                 Updated month
   */
  decrement(value: string, decrement: number): string {
    const original = Dates.toObject(`${value}-01`);
    const updated = subMonths(original, decrement);
    return Dates.fromObject(updated).substring(0, 7);
  },

  /**
   * Return the date string (YYYY-MM-DD) of the last date in the
   * specified month.
   *
   * @param {string} value            The specified month (YYYY-MM)
   * @return {string}                 The corresponding date (YYYY-MM-DD)
   */
  end(value: string): string {
    const date = Dates.toObject(`${value}-01`);
    return Dates.fromObject(endOfMonth(date));
  },

  /**
   * Return the specified month plus the specified increment (in months).
   *
   * @param {string} value            Original month
   * @param {number} increment        Number of months to increment
   * @return {string}                 Updated month
   */
  increment(value: string, increment: number): string {
    const original = Dates.toObject(`${value}-01`);
    const updated = addMonths(original, increment);
    return Dates.fromObject(updated).substring(0, 7);
  },

  /**
   * Return the date string (YYYY-MM-DD) of the first date in the
   * specified month.
   *
   * @param {string} value            The specified month (YYYY-MM)
   * @return {string}                 The corresponding date (YYYY-MM-DD)
   */
  start(value: string): string {
    const date = Dates.toObject(`${value}-01`);
    return Dates.fromObject(startOfMonth(date));
  },

  /**
   * Return the month string of the month containing today's date.
   *
   * @return {string}                 The month string containing today
   */
  today(): string {
    return Dates.today().substring(0, 7);
  },
};
