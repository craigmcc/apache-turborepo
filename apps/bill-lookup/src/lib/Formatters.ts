/**
 * Formatters for BILL values.
 */

// Internal Imports ----------------------------------------------------------

import {
  UserPlus
} from "@/types/types";

// Public Objects ------------------------------------------------------------

/**
 * Format a RAMP user email.
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
 * Format a RAMP user name.
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
 * Format a RAMP user role description.
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
 * Format a RAMP user type.
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
