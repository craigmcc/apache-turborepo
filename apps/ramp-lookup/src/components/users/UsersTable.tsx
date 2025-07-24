"use client";

/**
 * Overview table for Users.
 */

// External Imports ----------------------------------------------------------

import { DataTable } from "@repo/shared-components/DataTable";
import { TextFieldFilter } from "@repo/shared-components/TextFieldFilter";
import {
  ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { BookUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { UsersCsvExport } from "@/components/users/UsersCsvExport";
import { UserMoreInfo } from "@/components/users/UserMoreInfo";
import { formatDepartmentName, formatUserName } from "@/lib/Formatters";
import {  UserPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type UsersTableProps = {
  // All Users to display in the table
  allUsers: UserPlus[];
}

export function UsersTable({ allUsers }: UsersTableProps) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentUser, setCurrentUser] = useState<UserPlus | null>(null);
  const [departmentNameFilter, setDepartmentNameFilter] = useState<string>("");
  const [managerNameFilter, setManagerNameFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "user_name", desc: false },
  ]);
  const [userNameFilter, setUserNameFilter] = useState<string>("");

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    if (departmentNameFilter.length > 0) {
      filters.push({
        id: "department_name",
        value: departmentNameFilter,
      });
    }

    if (managerNameFilter.length > 0) {
      filters.push({
        id: "manager_name",
        value: managerNameFilter,
      });
    }

    if (userNameFilter.length > 0) {
      filters.push({
        id: "user_name",
        value: userNameFilter,
      });
    }

    setColumnFilters(filters);

  }, [departmentNameFilter, managerNameFilter, userNameFilter]);

  // Handle the "CSV Export" modal close
  function handleCsvExportClose() {
    setShowCsvExport(false);
  }

  // Handle the "CSV Export" modal open
  function handleCsvExportOpen() {
    setShowCsvExport(true);
  }

  // Handle the "More Info" modal close
  function handleMoreInfoClose() {
    setCurrentUser(null);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(user: UserPlus) {
    setCurrentUser(user);
    setShowMoreInfo(true);
  }

  // Column definitions for the Users table
  const columns = useMemo(() => [

    columnHelper.accessor(
      row => formatDepartmentName(row.department),
      {
        header: "Department Name",
        id: "department_name",
      }),

    columnHelper.accessor(
      row => formatUserName(row),
      {
        header: "User Name",
        id: "user_name",
      }),

    columnHelper.display({
      cell: info => info.row.original.email,
      header: "User Email",
      id: "email_address",
    }),

    columnHelper.accessor(
      row => formatUserName(row.manager),
      {
        enableSorting: false,
        header: "Card Manager Name",
        id: "manager_name",
      }),

    columnHelper.display({
      cell: info => info.row.original.role?.split("_")[1] || "n/a",
      header: "Role",
      id: "role",
    }),

    columnHelper.display({
      cell: info => {
        const status = info.row.original.status;
        if (status === "USER_ACTIVE") {
          return <span className="text-success">Active</span>;
        } else if (status === "USER_INACTIVE") {
          return <span className="text-danger">Inactive</span>;
        } else if (status === "USER_SUSPENDED") {
          return <span className="text-warning">Suspended</span>;
        } else if (status) {
          return <span>{status}</span>;
        } else {
          return <span>n/a</span>;
        }
      },
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
    data: allUsers,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      pagination,
      sorting,
    },
  });

  return (
    <Container className="p-2 mb-4 bg-light rounded-3" fluid>

      <Row>
        <h1 className="header text-center">
          <span className="me-5">Users Table</span>
          <Button
            className="bg-info"
            onClick={handleCsvExportOpen}
            size="lg"
          >
            Export CSV
          </Button>
        </h1>
      </Row>

      <Row className="mb-2">

        <Col>
          <TextFieldFilter
            controlId="departmentFilter"
            label="Filter by Department Name:"
            placeholder="Enter part of name"
            setTextFieldFilter={setDepartmentNameFilter}
            textFieldFilter={departmentNameFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="userFilter"
            label="Filter by User Name:"
            placeholder="Enter part of name"
            setTextFieldFilter={setUserNameFilter}
            textFieldFilter={userNameFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="managerFilter"
            label="Filter by Card Manager Name:"
            placeholder="Enter part of name"
            setTextFieldFilter={setManagerNameFilter}
            textFieldFilter={managerNameFilter}
          />
        </Col>

      </Row>

      <DataTable
        showPagination={true}
        table={table}
      />

      <UsersCsvExport
        hide={handleCsvExportClose}
        show={showCsvExport}
        users={table.getSortedRowModel().flatRows.map(row => row.original)}
      />

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
