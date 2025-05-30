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

  function handleSelectDepartment(department: DepartmentPlus) {
    if (department.id === selectedDepartment?.id) {
//      console.log("Unselecting department", department.name);
      changeSelectedDepartment(null);
    } else {
//      console.log("Selecting department", department.name);
      changeSelectedDepartment(department);
    }
  }

  // Column definitions
  const columnHelper = createColumnHelper<DepartmentPlus>();
  const columns = [
    columnHelper.display({
      cell: info => info.getValue(),
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

  // Overall table instance
  const table = useReactTable<DepartmentPlus>({
    columns,
    data: allDepartments,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
            onClick={() => handleSelectDepartment(row.original)}
          >
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
