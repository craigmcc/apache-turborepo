"use client";

/**
 * Overview table for Users.
 */

// External Imports ----------------------------------------------------------

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
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { DataTable } from "@/components/tables/DataTable";
import { UsersCsvExport } from "@/components/users/UsersCsvExport";
import { UserMoreInfo } from "@/components/users/UserMoreInfo";
import {
  formatUserEmail,
  formatUserName,
  formatUserRoleDescription,
  formatUserRoleType,
} from "@/lib/Formatters";
import {  UserPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type UsersTableProps = {
  // All Users to display in the table
  allUsers: UserPlus[];
}

export function UsersTable({ allUsers }: UsersTableProps) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentUser, setCurrentUser] = useState<UserPlus | null>(null);
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

    if (userNameFilter.length > 0) {
      filters.push({
        id: "user_name",
        value: userNameFilter,
      });
    }

    setColumnFilters(filters);

  }, [userNameFilter]);

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
    columnHelper.accessor(row => formatUserName(row), {
      cell: info => {
        return <span>{formatUserName(info.row.original)}</span>;
      },
      header: "User Name",
      id: "user_name",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{formatUserEmail(info.row.original)}</span>
      },
      header: "User Email",
      id: "email",
    }),
    columnHelper.display({
      cell: info => {
        const archived = info.row.original.archived;
        if (archived !== null) {
          if (archived) {
            return <span className="text-warning">Yes</span>;
          } else {
            return <span className="text-success">No</span>;
          }
        }  else {
          return <span>n/a</span>;
        }

        return <span>{info.getValue() ? "Yes" : "No"}</span>;
      },
      header: "Archived",
      id: "archived",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{formatUserRoleType(info.row.original)}</span>
      },
      header: "Role Type",
      id: "roleType",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{formatUserRoleDescription(info.row.original)}</span>
      },
      header: "Role Description",
      id: "roleDescription",
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
    onColumnFiltersChange: setColumnFilters,
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
