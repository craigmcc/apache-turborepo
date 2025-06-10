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
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {ArrowDownAZ, ArrowDownUp, ArrowUpAZ, BookUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { PaginationFooter } from "@/components/tables/PaginationFooter";
import { UserMoreInfo } from "@/components/users/UserMoreInfo";
import { DepartmentPlus, UserPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type UsersTableProps = {
  // All Departments for the selection filter
  allDepartments: DepartmentPlus[];
  // All Users to display in the table
  allUsers: UserPlus[];
}

export function UsersTable({ allDepartments, allUsers }: UsersTableProps) {

  const [currentUser, setCurrentUser] = useState<UserPlus>(placeholderUser);
  const [filteredUsers, setFilteredUsers] = useState<UserPlus[]>(allUsers);
  const [departmentNameFilter, setDepartmentNameFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "user_name", desc: false },
  ]);
  const [userNameFilter, setUserNameFilter] = useState<string>("");

  // Save the departments for name formatting
  departments = allDepartments;

  // Apply selection filters whenever they change
  useEffect(() => {

    let matchingUsers: UserPlus[] = allUsers;

    if (departmentNameFilter.length > 0) {
      matchingUsers = matchingUsers.filter(user => {
        const departmentName = formatDepartmentName(user);
        return departmentName.toLowerCase().includes(departmentNameFilter);
      });
    }

    if (userNameFilter.length > 0) {
      matchingUsers = matchingUsers.filter(user => {
        const userName = formatUserName(user);
        return userName.toLowerCase().includes(userNameFilter);
      });
    }

    setFilteredUsers(matchingUsers);

  }, [allUsers, departmentNameFilter, userNameFilter]);

  // Handle the "More Info" modal close
  function handleMoreInfoClose() {
    console.log("Closing More Info modal for user:", formatUserName(currentUser));
    setCurrentUser(placeholderUser);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(user: UserPlus) {
    console.log("Showing More Info for user:", formatUserName(user));
    setCurrentUser(user);
    setShowMoreInfo(true);
  }

  // Column definitions for the Users table
  const columns = useMemo(() => [
    columnHelper.accessor(row => formatDepartmentName(row), {
      cell: info => {
        return <span>{formatDepartmentName(info.row.original)}</span>
      },
      header: "Department Name",
      id: "department_name",
    }),
    columnHelper.accessor(row => formatUserName(row), {
      cell: info => {
        return <span>{formatUserName(info.row.original)}</span>;
      },
      header: "User Name",
      id: "user_name",
    }),
    columnHelper.display({
      cell: info => info.row.original.email,
      header: "User Email",
      id: "email_address",
    }),
    columnHelper.display({
      cell: info => info.row.original.role?.split("_")[1] || "n/a",
      header: "Role",
      id: "role",
    }),
    columnHelper.display({
      cell: info => info.row.original.status?.split("_")[1] || "n/a",
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
    columnHelper.display({
      cell: info => {
        return (
          // TODO - add a tooltip
          <span>
          <BookUp
            onClick={() => handleMoreInfoOpen(info.row.original)}
            style={{ cursor: "context-menu" }}
          />
        </span>
        );
      },
      header: "Info",
      id: "moreInfo",
    }),
  ], []);

  // Overall table instance
  const table = useReactTable<UserPlus>({
    columns,
    data: filteredUsers,
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
          Users Table
        </h1>
      </Row>
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="departmentFilter">
            <span>Filter by Department Name:</span>
            <Form.Control
              onChange={e => setDepartmentNameFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of a name to filter"
              type="text"
              value={departmentNameFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="nameFilter">
            <span>Filter by User Name:</span>
            <Form.Control
              onChange={e => setUserNameFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of a name to filter"
              type="text"
              value={userNameFilter}
            />
          </Form.Group>
        </Col>
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

      <UserMoreInfo
        hide={handleMoreInfoClose}
        show={showMoreInfo}
        user={currentUser}
      />

    </Container>
  );
}

// Private Objects -----------------------------------------------------------

/**
 * Helper for creating columns in the Users table.
 */
const columnHelper = createColumnHelper<UserPlus>();

/**
 * Save the department list for name formatting.
 */
let departments: DepartmentPlus[] = [];

/**
 * Format the department name for a user.
 */
function formatDepartmentName(user: UserPlus): string {
  if (!user.department_id) return "n/a";
  const department = departments.find(department => department.id === user.department_id);
  return department?.name || "n/a";
}

/**
 * Format the user name for a user.
 */
function formatUserName(user: UserPlus): string {
  return `${user.last_name}, ${user.first_name}`;
}

/**
 * Placeholder for the UserMoreInfo component.
 */
const placeholderUser: UserPlus = {
  // Scalar fields
  id: "",
  email: "",
  employee_id: null,
  first_name: null,
  is_manager: null,
  last_name: null,
  phone: null,
  role: null,
  status: "USER_INACTIVE",
  // Potential relationships
  entity_id: null,
  location_id: null,
  manager_id: null,
  // Actual relationships
  cards: null,
  department_id: null,
  department: null,
  limit_users: null,
}
