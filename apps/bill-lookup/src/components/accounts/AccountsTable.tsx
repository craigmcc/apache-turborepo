"use client";

/**
 * Overview table for Accounts.
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
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { AccountPlus } from "@/types/types";
import Button from "react-bootstrap/Button";
import { AccountsCsvExport } from "@/components/accounts/AccountsCsvExport";
import { AccountMoreInfo } from "@/components/accounts/AccountMoreInfo";

// Public Objects ------------------------------------------------------------

export type AccountsTableProps = {
  // All Accounts to display in the table
  allAccounts: AccountPlus[];
};

export function AccountsTable({ allAccounts }: AccountsTableProps) {

  const [accountFilter, setAccountFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentAccount, setCurrentAccount] = useState<AccountPlus | null>(null);
  const [nameFilter, setNameFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    {id: "accountNumber", desc: false},
  ]);
  const [typeFilter, setTypeFilter] = useState<string>("");

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    if (accountFilter.length > 0) {
      filters.push({
        id: "accountNumber",
        value: accountFilter,
      });
    }
    if (nameFilter.length > 0) {
      filters.push({
        id: "name",
        value: nameFilter,
      });
    }
    if (typeFilter.length > 0) {
      filters.push({
        id: "accountType",
        value: typeFilter,
      });
    }

    setColumnFilters(filters);

  }, [accountFilter, nameFilter, typeFilter]);

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
    setCurrentAccount(null);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(account: AccountPlus) {
    setCurrentAccount(account);
    setShowMoreInfo(true);
  }

  // Column definitions for the Accounts table
  const columns = useMemo(() => [

    columnHelper.accessor(row => row.accountNumber, {
      header: "GL Account",
      id: "accountNumber",
    }),

    columnHelper.accessor(row => row.name, {
      header: "Account Name",
      id: "name",
    }),

    columnHelper.accessor(row => row.accountType, {
      header: "Account Type",
      id: "accountType",
    }),

    columnHelper.display({
      cell: info => {
        const active = info.row.original.isActive;
        if (active !== null) {
          if (active) {
            return <span className="text-success">Yes</span>;
          } else {
            return <span className="text-warning">No</span>;
          }
        }
        return <span className="text-danger">Unknown</span>;
      },
      header: "Active",
      id: "isActive",
    }),

    columnHelper.display({
      header: "#Bills",
      cell: info => {
        return info.row.original.billClassifications?.length || 0;
      },
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

  const table = useReactTable({
    data: allAccounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
          <span className="me-5">Accounts Table</span>
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
            controlId="accountFilter"
            label="Filter by Account Number:"
            placeholder="Enter YYYYMMDD"
            setTextFieldFilter={setAccountFilter}
            textFieldFilter={accountFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="nameFilter"
            label="Filter by Account Name:"
            placeholder="Enter part of name"
            setTextFieldFilter={setNameFilter}
            textFieldFilter={nameFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="typeFilter"
            label="Filter by Account Type:"
            placeholder="Enter part of type"
            setTextFieldFilter={setTypeFilter}
            textFieldFilter={typeFilter}
          />
        </Col>

      </Row>

      <DataTable
        showPagination={true}
        table={table}
      />

      <AccountsCsvExport
        accounts={table.getSortedRowModel().flatRows.map(row => row.original)}
        hide={handleCsvExportClose}
        show={showCsvExport}
      />

      <AccountMoreInfo
        account={currentAccount}
        hide={handleMoreInfoClose}
        show={showMoreInfo}
      />

    </Container>
  );

}

// Private Objects -----------------------------------------------------------

const columnHelper = createColumnHelper<AccountPlus>();
