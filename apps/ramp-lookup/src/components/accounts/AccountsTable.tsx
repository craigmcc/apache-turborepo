"use client";

/**
 * Overview table for Accounts.
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
import { ArrowDownAZ, ArrowUpAZ, ArrowDownUp } from "lucide-react";
import { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { PaginationFooter } from "@/components/tables/PaginationFooter";
import { AccountingGLAccountPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type AccountsTableProps = {
  // All Departments to display in the table
  allAccounts: AccountingGLAccountPlus[];
}

export function AccountsTable({ allAccounts }: AccountsTableProps) {

  const [filteredAccounts, setFilteredAccounts] = useState<AccountingGLAccountPlus[]>(allAccounts);
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

    let matchingAccounts: AccountingGLAccountPlus[] = allAccounts;

    if (nameFilter.length > 0) {
      matchingAccounts = matchingAccounts.filter(account =>
        account.name.toLowerCase().includes(nameFilter)
      );
    }

    if (typeFilter.length > 0) {
      matchingAccounts = matchingAccounts.filter(account =>
        account.classification === typeFilter
      );
    }

    setFilteredAccounts(matchingAccounts);

  }, [allAccounts, nameFilter, typeFilter]);

  // Overall table instance
  const table = useReactTable<AccountingGLAccountPlus>({
    columns,
    data: filteredAccounts,
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

// MUST match RampAccountingGLAccountClassification options
// from packages/ramp-api/src/Models.ts
const ACCOUNT_TYPES = [
  "ANY", "ASSET", "CREDCARD", "EQUITY", "EXPENSE",
  "LIABILITY", "REVENUE", "UNKNOWN",
];

/**
 * Column definitions for the table.
 */
const columnHelper = createColumnHelper<AccountingGLAccountPlus>();
const columns = [
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
];
