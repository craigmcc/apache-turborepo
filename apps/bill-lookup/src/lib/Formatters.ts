/**
 * Formatters for BILL values.
 */

// Internal Imports ----------------------------------------------------------

import {
  AccountPlus,
  BillPlus,
  UserPlus,
  VendorPlus,
} from "@/types/types";

// Public Objects ------------------------------------------------------------

/**
 * Format an Account number and name
 */
export function formatAccountNumberAndName(account: AccountPlus | null | undefined): string {
  if (account && account.accountNumber && account.name) {
    return `${account.accountNumber} - ${account.name}`;
  } else if (account && account.accountNumber) {
    return `${account.accountNumber} - n/a`;
  } else if (account && account.name) {
    return `n/a - ${account.name}`;
  } else {
    return "n/a";
  }
}

/**
 * Format a Bill amount
 */
export function formatBillAmount(bill: BillPlus | null | undefined): string {
  return bill?.amount?.toFixed(2) || "n/a";
  }

/**
 * Format a Bill due date
 */
export function formatBillDueDate(bill: BillPlus | null | undefined): string {
  return bill?.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "n/a";
}

/**
 * Format a Bill exchange rate
 */
export function formatBillExchangeRate(bill: BillPlus | null | undefined): string {
  return bill?.exchangeRate?.toFixed(2) || "n/a";
}

/**
 * Format a Bill invoice date
 */
export function formatBillInvoiceDate(bill: BillPlus | null | undefined): string {
  return bill?.invoiceDate ? new Date(bill.invoiceDate).toLocaleDateString() : "n/a";
}

/**
 * Format a Bill paid amount
 */
export function formatBillPaidAmount(bill: BillPlus | null | undefined): string {
  return bill?.paidAmount?.toFixed(2) || "n/a";
}

/**
 * Format a User email.
 */
export function formatUserEmail(user: UserPlus | null | undefined): string {
  return user?.email || "n/a";
}

/**
 * Format a User name.
 */
export function formatUserName(user: UserPlus | null | undefined): string {
  if (user && user.firstName && user.lastName) {
    return `${user.lastName}, ${user.firstName}`;
  } else {
    return "n/a";
  }
}

/**
 * Format a User role description.
 *
 * @param user User object
 */
export function formatUserRoleDescription(user: UserPlus | null | undefined): string {
  return user?.roleDescription || "n/a";
}

/**
 * Format a User role type.
 */
export function formatUserRoleType(user: UserPlus | null | undefined): string {
  return user?.roleType || "n/a";
}

/**
 * Format a Vendor email.
 */
export function formatVendorEmail(vendor: VendorPlus | null | undefined): string {
  return vendor?.email || "n/a";
}

/**
 * Format a Vendor name.
 */
export function formatVendorName(vendor: VendorPlus | null | undefined): string {
  return vendor?.name || "n/a";
}
