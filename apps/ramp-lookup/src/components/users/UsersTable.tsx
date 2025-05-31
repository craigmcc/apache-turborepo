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
//  getPaginationRowModel,
//  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import Container from "react-bootstrap/Container";

// Internal Imports ----------------------------------------------------------

// import { useSelectedDepartmentContext } from "@/contexts/SelectedDepartmentContext";
import { useSelectedUserContext } from "@/contexts/SelectedUserContext";
import { UserPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type UsersTableProps = {
  // All Users to display in the table
  allUsers: UserPlus[];
}

export function UsersTable({ allUsers }: UsersTableProps) {

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
      cell: info => info.row.original.department?.name || "N/A",
      header: "Department",
      id: "department",
    }),
    columnHelper.display({
      cell: info => {
        const cardsCount = info.row.original.cards?.length || 0;
        return <span>{cardsCount}</span>
      },
      header: "#Cards",
      id: "cardsCount",
    }),
  ];

  // Overall table instance
  const table = useReactTable<UserPlus>({
    columns,
    data: allUsers,
    getCoreRowModel: getCoreRowModel(),
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
      </table>
    </Container>
  );
}
