/**
 * Base page for Departments.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { DepartmentsTable } from "@/components/departments/DepartmentsTable";
import { dbRamp } from "@repo/ramp-db/dist";

// Public Objects ------------------------------------------------------------

export default async function DepartmentsPage() {

  const allDepartments = await dbRamp.department.findMany({
    include: {
      users: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <DepartmentsTable allDepartments={allDepartments}/>
  );

}
