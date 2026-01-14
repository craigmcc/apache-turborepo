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

  const [accountSubTypeFilter, setAccountSubTypeFilter] = useState<string>("");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("");
  const [acctNumFilter, setAcctNumFilter] = useState<string>("");
  const [classificationFilter, setClassificationFilter] = useState<string>("");
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
    {id: "acctNum", desc: false},
  ]);

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    if (acctNumFilter.length > 0) {
      filters.push({
        id: "acctNum",
        value: acctNumFilter,
      });
    }
    if (accountSubTypeFilter.length > 0) {
      filters.push({
        id: "accountSubType",
        value: accountSubTypeFilter,
      });
    }
    if (accountTypeFilter.length > 0) {
      filters.push({
        id: "accountType",
        value: accountTypeFilter,
      });
    }
    if (classificationFilter.length > 0) {
      filters.push({
        id: "classification",
        value: classificationFilter,
      });
    }
    if (nameFilter.length > 0) {
      filters.push({
        id: "name",
        value: nameFilter,
      });
    }

    setColumnFilters(filters);

  }, [accountSubTypeFilter, accountTypeFilter, acctNumFilter, classificationFilter, nameFilter]);

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

    columnHelper.accessor(row => row.acctNum || "n/a", {
      header: "GL Account",
      id: "acctNum",
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId);
        const b = rowB.getValue(columnId);

        // Check if values are null or undefined
        const isANull = a === null || typeof a === 'undefined' || a === '';
        const isBNull = b === null || typeof b === 'undefined' || b === '';

        // Logic to put nulls last
        if (isANull && isBNull) return 0; // Both are null/empty, treat as equal for sorting
        if (isANull) return 1; // A is null/empty, B is not: put A after B
        if (isBNull) return -1; // B is null/empty, A is not: put B after A

        // Use default comparison for non-null values
        if (a > b) return 1;
        if (b > a) return -1;
        return 0;

      },
    }),

    columnHelper.accessor(row => row.name, {
      header: "Account Name",
      id: "name",
    }),

    columnHelper.accessor(row => row.accountType, {
      header: "Account Type",
      id: "accountType",
    }),

    columnHelper.accessor(row => row.accountSubType, {
      header: "Account SubType",
      id: "accountSubType",
    }),

    columnHelper.accessor(row => row.classification, {
      header: "Classification",
      id: "classification",
    }),

    columnHelper.display({
      cell: info => {
        const active = info.row.original.active;
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
      id: "active",
    }),

    columnHelper.display({
      header: "#Children",
      cell: info => {
        return info.row.original.childAccounts?.length || 0;
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
            controlId="acctNumFilter"
            label="Filter by Account Number:"
            placeholder="Enter part of account number"
            setTextFieldFilter={setAcctNumFilter}
            textFieldFilter={acctNumFilter}
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
            controlId="accountTypeFilter"
            label="Filter by Account Type:"
            placeholder="Enter part of type"
            setTextFieldFilter={setAccountTypeFilter}
            textFieldFilter={accountTypeFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="accountSubTypeFilter"
            label="Filter by Account SubType:"
            placeholder="Enter part of subtype"
            setTextFieldFilter={setAccountSubTypeFilter}
            textFieldFilter={accountSubTypeFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="classificationFilter"
            label="Filter by Classification:"
            placeholder="Enter classification"
            setTextFieldFilter={setClassificationFilter}
            textFieldFilter={classificationFilter}
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
