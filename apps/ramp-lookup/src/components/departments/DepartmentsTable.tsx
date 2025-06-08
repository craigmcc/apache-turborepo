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
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, ArrowDownUp } from "lucide-react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import {PaginationFooter} from "@/components/tables/PaginationFooter";
import { DepartmentPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type DepartmentsTableProps = {
  // All Departments to display in the table
  allDepartments: DepartmentPlus[];
}

export function DepartmentsTable({ allDepartments }: DepartmentsTableProps) {

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "department_name", desc: false },
  ]);

  // Overall table instance
  const table = useReactTable<DepartmentPlus>({
    columns,
    data: allDepartments,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
  });

  return (
    <Container className="p-2 mb-4 bg-light rounded-3" fluid>

      <Row>
        <h1 className="header text-center">
          Departments Table
        </h1>
      </Row>

      <table className="table table-bordered table-striped">

        <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id} colSpan={header.colSpan}>
                {flexRender(header.column.columnDef.header, header.getContext())}
                { header.column.getCanSort() ? (
                    <>
                    <span
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: "pointer" }}
                    >
                      {header.column.getIsSorted() === "asc" ? (
                        <ArrowUpAZ className="ms-2 text-info" size={24}/>
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDownAZ className="ms-2 text-info" size={24}/>
                      ) : (
                        <ArrowDownUp className="ms-2 text-info" size={24}/>
                      )}
                    </span>
                    </>
                  ) :
                  null
                }
              </th>
            ))}
          </tr>
        ))}
        </thead>

        <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
        </tbody>

        <tfoot>
        <tr>
          <th colSpan={table.getCenterLeafColumns().length}>
            <PaginationFooter table={table}/>
          </th>
        </tr>
        </tfoot>


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
  columnHelper.accessor(row => formatDepartmentName(row), {
    cell: info => {
      return <span>{formatDepartmentName(info.row.original)}</span>;
    },
    header: "Department Name",
    id: "department_name",
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

/**
 * Format the department name for a department
 */
function formatDepartmentName(department: DepartmentPlus): string {
  return department.name;
}
