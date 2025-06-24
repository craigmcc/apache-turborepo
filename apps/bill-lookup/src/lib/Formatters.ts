/**
 * Formatters for BILL values.
 */

// Internal Imports ----------------------------------------------------------

import {
  UserPlus,
  VendorPlus,
} from "@/types/types";

// Public Objects ------------------------------------------------------------

/**
 * Format a Bill user email.
 *
 * @param user User object
 */
export function formatUserEmail(user: UserPlus | null | undefined): string {
  if (user && user.email) {
    return `${user.email}`;
  } else {
    return "n/a";
  }
}

/**
 * Format a Bill user name.
 *
 * @param user User object
 */
export function formatUserName(user: UserPlus | null | undefined): string {
  if (user && user.firstName && user.lastName) {
    return `${user.lastName}, ${user.firstName}`;
  } else {
    return "n/a";
  }
}

/**
 * Format a Bill user role description.
 *
 * @param user User object
 */
export function formatUserRoleDescription(user: UserPlus | null | undefined): string {
  if (user && user.roleDescription) {
    return `${user.roleDescription}`;
  } else {
    return "n/a";
  }
}

/**
 * Format a Bill user role type.
 *
 * @param user User object
 */
export function formatUserRoleType(user: UserPlus | null | undefined): string {
  if (user && user.roleType) {
    return `${user.roleType}`;
  } else {
    return "n/a";
  }
}

/**
 * Format a Bill vendor email.
 *
 * @param vendor Vendor object
 */
export function formatVendorEmail(vendor: VendorPlus | null | undefined): string {
  if (vendor && vendor.email) {
    return `${vendor.email}`;
  } else {
    return "n/a";
  }
}

/**
 * Format a Bill vendor name.
 *
 * @param vendor Vendor object
 */
export function formatVendorName(vendor: VendorPlus | null | undefined): string {
  if (vendor && vendor.name) {
    return `${vendor.name}`;
  } else {
    return "n/a";
  }
}

