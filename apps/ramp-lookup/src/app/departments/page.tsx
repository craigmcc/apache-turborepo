/**
 * Base page for departments.
 */

// External Imports ----------------------------------------------------------

import Container from "react-bootstrap/Container";

// Internal Imports ----------------------------------------------------------

import { DepartmentsTable } from "@/components/departments/DepartmentsTable";
import {dbRamp} from "@repo/ramp-db/dist";

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
      <Container className="p-2 mb-4 bg-light rounded-3" fluid>
        <h1 className="header text-center">
          Departments Table
        </h1>
        <DepartmentsTable allDepartments={allDepartments}/>
      </Container>
  );
}
