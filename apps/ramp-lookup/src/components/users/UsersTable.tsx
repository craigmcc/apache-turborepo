"use client";

/**
 * Overview table for Users.
 */

// External Imports ----------------------------------------------------------

import {
//  CellContext,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import Container from "react-bootstrap/Container";
import { useState } from "react";

// Internal Imports ----------------------------------------------------------

// import { useSelectedDepartmentContext } from "@/contexts/SelectedDepartmentContext";
import { useSelectedUserContext } from "@/contexts/SelectedUserContext";
import { UserPlus } from "@/types/types";
import { PaginationFooter } from "@/components/tables/PaginationFooter";

// Public Objects ------------------------------------------------------------

export type UsersTableProps = {
  // All Users to display in the table
  allUsers: UserPlus[];
}

export function UsersTable({ allUsers }: UsersTableProps) {

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
//  const { selectedDepartment, changeSelectedDepartment } = useSelectedDepartmentContext();
  const { selectedUser, changeSelectedUser } = useSelectedUserContext();

  function handleSelectUser(user: UserPlus) {
    if (user.id === selectedUser?.id) {
//      console.log("Unselecting user", user.name);
      changeSelectedUser(null);
    } else {
//      console.log("Selecting user", user.name);
      changeSelectedUser(user);
    }
  }

  // Column definitions
  const columnHelper = createColumnHelper<UserPlus>();
  const columns = [
    columnHelper.display({
      cell: info => {
        const name = `${info.row.original.last_name}, ${info.row.original.first_name}`;
        return <span>{name}</span>;
      },
      header: "Name",
      id: "name",
    }),
    columnHelper.display({
      cell: info => info.row.original.email || "N/A",
      header: "Email",
      id: "email",
    }),
    columnHelper.display({
      cell: info => info.row.original.department?.name || "N/A",
      header: "Department",
      id: "department",
    }),
    columnHelper.display({
      cell: info => info.row.original.role?.split("_")[1] || "N/A",
      header: "Role",
      id: "role",
    }),
    columnHelper.display({
      cell: info => info.row.original.status?.split("_")[1] || "N/A",
      header: "Status",
      id: "status",
    }),
    columnHelper.display({
      cell: info => info.row.original.cards?.length || 0,
      header: "#Cards",
      id: "cardsCount",
    }),
    columnHelper.display({
      cell: info => info.row.original.limit_users?.length || 0,
      header: "#Limits",
      id: "limitsCount",
    }),
  ];

  // Overall table instance
  const table = useReactTable<UserPlus>({
    columns,
    data: allUsers,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  return (
    <Container className="p-2 mb-4 bg-light rounded-3" fluid>

      <h1 className="header text-center">
        Users Table
      </h1>
      <div className="text-center">
        Click on a row to select or deselect a User.
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
            className={selectedUser?.id === row.original.id ? "table-primary" : ""}
            key={row.id}
            onClick={() => handleSelectUser(row.original)}
          >
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
            <div className="divider"/>
          </th>
        </tr>
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
