/**
 * Base page for Users.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { UsersTable } from "@/components/users/UsersTable";
import { dbBill } from "@repo/bill-db/dist";

// Public Objects ------------------------------------------------------------

export default async function UsersPage() {

  const allUsers = await dbBill.user.findMany({
    orderBy: [
      { lastName: "asc" },
      { firstName: "asc" },
    ],
  });

  return (
    <UsersTable
      allUsers={allUsers}
    />
  );

}
