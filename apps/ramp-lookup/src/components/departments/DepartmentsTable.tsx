"use client";

/**
 * Overview table for Departments.
 */

// External Imports ----------------------------------------------------------

import { DataTable } from "@repo/shared-components/DataTable";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { formatDepartmentName } from "@/lib/Formatters";
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

  // Column definitions for the Departments table
  const columns = useMemo(() =>   [
    columnHelper.accessor(row => formatDepartmentName(row), {
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
  ], []);

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

      <DataTable
        showPagination={true}
        table={table}
      />

    </Container>
  );
}

// Private Objects -----------------------------------------------------------

/**
 * Helper for column definitions for this table.
 */
const columnHelper = createColumnHelper<DepartmentPlus>();
