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
import { ChangeEvent, useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { useSelectedDepartmentContext } from "@/contexts/SelectedDepartmentContext";
import { useSelectedUserContext } from "@/contexts/SelectedUserContext";
import { DepartmentPlus, UserPlus } from "@/types/types";
import { PaginationFooter } from "@/components/tables/PaginationFooter";

// Public Objects ------------------------------------------------------------

export type UsersTableProps = {
  // All Departments for the selection filter
  allDepartments: DepartmentPlus[];
  // All Users to display in the table
  allUsers: UserPlus[];
}

export function UsersTable({ allDepartments, allUsers }: UsersTableProps) {

  const [filteredUsers, setFilteredUsers] = useState<UserPlus[]>(allUsers);
  const [nameFilter, setNameFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const {selectedDepartment, changeSelectedDepartment} = useSelectedDepartmentContext();
  const {selectedUser, changeSelectedUser} = useSelectedUserContext();

  // Whenever the selected department or name filter changes, reapply filters
  useEffect(() => {
//    console.log(`filteringUsers: departmentFilter='${selectedDepartment?.name || "All"'} nameFilter='${nameFilter}'`);
    let matchingUsers: UserPlus[] = allUsers;
    // Filter by selected department (if any)
    if (selectedDepartment) {
      matchingUsers = matchingUsers.filter(user => user.department?.id === selectedDepartment.id);
    }
    // Filter by name (if any)
    if (nameFilter.length > 0) {
      const filterValue = nameFilter.toLowerCase();
      matchingUsers = matchingUsers.filter(user => {
        const fullName = `${user.last_name}, ${user.first_name}`.toLowerCase();
        return fullName.includes(filterValue);
      });
    }
    // Set the current filtered users
    setFilteredUsers(matchingUsers);
  }, [allUsers, nameFilter, selectedDepartment]);

  function handleNameFilter(event: ChangeEvent<HTMLInputElement>) {
    const filterValue = event.target.value.toLowerCase();
    setNameFilter(filterValue);
  }

  function handleSelectDepartment(event: ChangeEvent<HTMLSelectElement>) : void {
    const departmentId = event.target.value;
    const department = allDepartments.find(d => d.id === departmentId);
    changeSelectedDepartment(department || null);
  }

  function handleSelectUser(cellId: string, user: UserPlus) {
//    console.log(`handleSelectUser cellId=${cellId} user=${user.last_name}, ${user.first_name}`);
    if (cellId.endsWith("_name")) {
      if (user.id === selectedUser?.id) {
        changeSelectedUser(null);
      } else {
        changeSelectedUser(user);
      }
    }
  }

  // Overall table instance
  const table = useReactTable<UserPlus>({
    columns,
    data: filteredUsers,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  return (
    <Container className="p-2 mb-4 bg-light rounded-3" fluid>

      <Row>
        <h1 className="header text-center">
          Users Table
        </h1>
      </Row>
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="departmentSelect">
            <span>Filter by Department:</span>
            <Form.Select
              onChange={handleSelectDepartment}
              value={selectedDepartment?.id || ""}
            >
              <option value="">(All Departments)</option>
              {allDepartments.map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="nameFilter">
            <span>Filter by Name:</span>
            <Form.Control
              onChange={handleNameFilter}
              placeholder="Enter part of a name to filter"
              type="text"
              value={nameFilter}
            />
          </Form.Group>
        </Col>
        <Col className="text-center">
          Click on a name to select or deselect that User.
        </Col>
      </Row>

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
          >
            {row.getVisibleCells().map(cell => (
              <td
                key={cell.id}
                onClick={() => handleSelectUser(cell.id, row.original)}
              >
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
