"use client";

/**
 * Overview table for Accounts.
 */

// External Imports ----------------------------------------------------------

import { DataTable } from "@repo/shared-components/DataTable";
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
import { useEffect, useMemo, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { AccountingGLAccountPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type AccountsTableProps = {
  // All Accounts to display in the table
  allAccounts: AccountingGLAccountPlus[];
}

export function AccountsTable({ allAccounts }: AccountsTableProps) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [nameFilter, setNameFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "gl_account", desc: false },
  ]);
  const [typeFilter, setTypeFilter] = useState<string>("");

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    if (nameFilter.length > 0) {
      filters.push({
        id: "account_name",
        value: nameFilter,
      });
    }

    if (typeFilter.length > 0) {
      filters.push({
        id: "account_type",
        value: typeFilter,
      });
    }

    setColumnFilters(filters);

  }, [nameFilter, typeFilter]);

  // Column definitions for the table
  const columns = useMemo(() =>   [
    columnHelper.accessor(row => row.code, {
      cell: info => {
        return <span>{info.row.original.code}</span>;
      },
      enableSorting: true,
      header: "GL Account",
      id: "gl_account",
    }),
    columnHelper.accessor(row => row.classification, {
      cell: info => {
        return <span>{info.row.original.classification}</span>;
      },
      enableSorting: true,
      header: "Account Type",
      id: "account_type",
    }),
    columnHelper.accessor(row => row.name, {
      cell: info => {
        return <span>{info.row.original.name}</span>;
      },
      enableSorting: true,
      header: "Account Name",
      id: "account_name",
    }),
    columnHelper.display({
      cell: info => {
        const is_active = info.row.original.is_active;
        if (is_active) {
          return <span className="text-success">Yes</span>;
        } else {
          return <span className="text-danger">No</span>;
        }
      },
      header: "Active?",
      id: "active",
    }),
  ], []);

  // Overall table instance
  const table = useReactTable<AccountingGLAccountPlus>({
    columns,
    data: allAccounts,
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
          Accounts Table
        </h1>
      </Row>
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="typeFilter">
            <span>Filter by Account Type:</span>
            <Form.Select
              onChange={(e) => setTypeFilter(e.target.value)} // Values are upper case
              value={typeFilter}
            >
              <option key="" value="">(All Types)</option>
              {ACCOUNT_TYPES.map(accountType => (
                <option key={accountType} value={accountType}>
                  {accountType}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="nameFilter">
            <span>Filter by Account Name:</span>
            <Form.Control
              onChange={(e) => setNameFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of a name to filter"
              type="text"
              value={nameFilter}
            />
          </Form.Group>
        </Col>
      </Row>

      <DataTable
        showPagination={true}
        table={table}
      />

    </Container>
  );
}

// Private Objects -----------------------------------------------------------

// MUST match RampAccountingGLAccountClassification options
// from packages/ramp-api/src/Models.ts
const ACCOUNT_TYPES = [
  "ANY", "ASSET", "CREDCARD", "EQUITY", "EXPENSE",
  "LIABILITY", "REVENUE", "UNKNOWN",
];

/**
 * Helper for column definitions for the table.
 */
const columnHelper = createColumnHelper<AccountingGLAccountPlus>();
