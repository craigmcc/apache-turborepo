/**
 * Base page for Users.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { UsersTable } from "@/components/users/UsersTable";
import { dbRamp } from "@repo/ramp-db/dist";

// Public Objects ------------------------------------------------------------

export default async function UsersPage() {

  const allDepartments = await dbRamp.department.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const allUsers = await dbRamp.user.findMany({
    include: {
      cards: true,
      department: true,
      limit_users: {
        include: {
          limit: true,
        },
      },
    },
    orderBy: [
      { last_name: "asc" },
      { first_name: "asc" },
    ],
  });

  return (
    <UsersTable
      allDepartments={allDepartments}
      allUsers={allUsers}
    />
  );

}
