"use client";

/**
 * Overview table for Departments.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { DepartmentPlus } from "@/types/types";
import {useSelectedDepartmentContext} from "@/contexts/SelectedDepartmentContext";

// Public Objects ------------------------------------------------------------

export type DepartmentsTableProps = {
  allDepartments: DepartmentPlus[];
}

export function DepartmentsTable({ allDepartments }: DepartmentsTableProps) {

  const { selectedDepartment, changeSelectedDepartment } = useSelectedDepartmentContext();

  function handleSelectDepartment(department: DepartmentPlus) {
    if (department.id === selectedDepartment?.id) {
//      console.log("Unselecting department", department.name);
      changeSelectedDepartment(null);
    } else {
//      console.log("Selecting department", department.name);
      changeSelectedDepartment(department);
    }
  }

  return (
    <>
      <p className="header text-center">Click on a Department to use it as a filter in other searches</p>
      <div className="p-2 mb-4 bg-light rounded-3">
        <table className="table table-bordered table-striped">
          <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">#Users</th>
          </tr>
          </thead>
          <tbody>
          {allDepartments.map((department) => (
            <tr
              className={selectedDepartment?.id === department.id ? "table-primary" : ""}
              key={department.id}
              onClick={() => handleSelectDepartment(department)}
            >
              <td>{department.name}</td>
              <td>{department.users?.length || 0}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
