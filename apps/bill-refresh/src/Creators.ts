/**
 * Utility functions for creating Prisma models from Bill API models.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import {
  BillUser,
} from "@repo/bill-api/Models";
import {
  User,
} from "@repo/bill-db/Models";

// Public Objects ------------------------------------------------------------

export function createUser(billUser: BillUser): User {
  return {
    // Scalar fields
    id: billUser.id,
    archived: billUser.archived,
    createdTime: billUser.createdTime,
    email: billUser.email,
    firstName: billUser.firstName,
    lastName: billUser.lastName,
    roleDescription: billUser.role.description || null,
    roleId: billUser.role.id || null,
    roleType: billUser.role.type || null,
    updatedTime: billUser.updatedTime,
    // Potential relationships
    // Actual relationships
  };
}
