"use client";

/**
 * Overview table for Departments.
 */

// External Imports ----------------------------------------------------------

import {
//  CellContext,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
//  getPaginationRowModel,
//  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import Container from "react-bootstrap/Container";

// Internal Imports ----------------------------------------------------------

import {useSelectedDepartmentContext} from "@/contexts/SelectedDepartmentContext";
import { DepartmentPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type DepartmentsTableProps = {
  // All Departments to display in the table
  allDepartments: DepartmentPlus[];
}

export function DepartmentsTable({ allDepartments }: DepartmentsTableProps) {

  const { selectedDepartment, changeSelectedDepartment } = useSelectedDepartmentContext();

  function handleSelectDepartment(cellId: string, department: DepartmentPlus) {
    if (cellId.endsWith("_name")) {
      if (department.id === selectedDepartment?.id) {
//      console.log("Unselecting department", department.name);
        changeSelectedDepartment(null);
      } else {
//      console.log("Selecting department", department.name);
        changeSelectedDepartment(department);
      }
    }
  }

  // Overall table instance
  const table = useReactTable<DepartmentPlus>({
    columns,
    data: allDepartments,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Container className="p-2 mb-4 bg-light rounded-3" fluid>
      <h1 className="header text-center">
        Departments Table
      </h1>
      <div className="text-center">
        Click on a name to select or deselect that Department.
      </div>
      <table className="table table-bordered table-striped">
        <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id} colSpan={header.colSpan}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
        </thead>
        <tbody>
        {table.getRowModel().rows.map(row => (
          <tr
            className={selectedDepartment?.id === row.original.id ? "table-primary" : ""}
            key={row.id}
          >
            {row.getVisibleCells().map(cell => (
              <td
                key={cell.id}
                onClick={() => handleSelectDepartment(cell.id, row.original)}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
        </tbody>
      </table>
    </Container>
  );
}

// Private Objects -----------------------------------------------------------

/**
 * Column definitions for the table.
 */
const columnHelper = createColumnHelper<DepartmentPlus>();
const columns = [
  columnHelper.display({
    cell: info => {
      return <span>{info.row.original.name}</span>;
    },
    header: "Name",
    id: "name",
  }),
  columnHelper.display({
    cell: info => {
      const usersCount = info.row.original.users?.length || 0;
      return <span>{usersCount}</span>
    },
    header: "#Users",
    id: "usersCount",
  }),
];
