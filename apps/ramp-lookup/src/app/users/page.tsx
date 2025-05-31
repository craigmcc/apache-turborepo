/**
 * Base page for Users.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { UsersTable } from "@/components/users/UsersTable";
import { dbRamp } from "@repo/ramp-db/dist";

// Public Objects ------------------------------------------------------------

export default async function UsersPage() {

  const allUsers = await dbRamp.user.findMany({
    include: {
      cards: true,
      department: true,
    },
    orderBy: [
      { last_name: "asc" },
      { first_name: "asc" },
    ],
  });

  return (
    <UsersTable allUsers={allUsers}/>
  );

}
