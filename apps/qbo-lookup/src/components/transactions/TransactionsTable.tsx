"use client";

/**
 * Overview table for Transactions.
 */

// External Imports ----------------------------------------------------------

import { DataTable } from "@repo/shared-components/DataTable";
import { AccountGroupFilter } from "@repo/shared-components/AccountGroupFilter";
import { TextFieldFilter } from "@repo/shared-components/TextFieldFilter";
import { clientLogger as logger, isAccountInGroup } from "@repo/shared-utils";
import {
  ColumnFiltersState,
  createColumnHelper, FilterFn,
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
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { TransactionPlus } from "@/types/types";
import { TransactionsCsvExport } from "@/components/transactions/TransactionsCsvExport";
import { TransactionMoreInfo } from "@/components/transactions/TransactionMoreInfo";
import { TransactionsXlsxExport } from "@/components/transactions/TransactionsXlsxExport";
import {formatAccountNumberAndName, formatString} from "@/lib/Formatters";

// Public Objects ------------------------------------------------------------

export type TransactionsTableProps = {
  // All Transactions to display in the table
  allTransactions: TransactionPlus[];
};

export function TransactionsTable({ allTransactions }: TransactionsTableProps) {

  const [accountFilter, setAccountFilter] = useState<string>("");
  const [accountGroupFilter, setAccountGroupFilter] = useState<string>("All");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionPlus | null>(null);
  const [fromDateFilter, setFromDateFilter] = useState<string>("");
  const [memoFilter, setMemoFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [showXlsxExport, setShowXlsxExport] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "gl_account", desc: false },
    { id: "date", desc: false },
  ]);
  const [toDateFilter, setToDateFilter] = useState<string>("");

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    if (accountFilter) {
      filters.push({
        id: "gl_account",
        value: accountFilter,
      });
    }

    if (accountGroupFilter !== "All") {
      filters.push({
        id: "account_group",
        value: accountGroupFilter,
      });
    }

    const dateFilter = `${fromDateFilter}|${toDateFilter}`;
    if (dateFilter !== "|") {
      filters.push({
        id: "date",
        value: dateFilter,
      });
    }

    if (memoFilter) {
      filters.push({
        id: "memo",
        value: memoFilter,
      });
    }

    setColumnFilters(filters);

  }, [accountFilter, accountGroupFilter, fromDateFilter, memoFilter, toDateFilter]);

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
    setCurrentTransaction(null);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(transaction: TransactionPlus) {
    setCurrentTransaction(transaction);
    setShowMoreInfo(true);
  }

  // Handle the "XLSX Export" modal close
  function handleXlsxExportClose() {
    setShowXlsxExport(false);
  }

  // Handle the "XLSX Export" modal open
  function handleXlsxExportOpen() {
    setShowXlsxExport(true);
  }

  // Column definitions for the Transactions table
  const columns = useMemo(() => [

    columnHelper.accessor(row => formatAccountNumberAndName(row.account), {
      header: "GL Account",
      id: "gl_account",
    }),

    columnHelper.accessor(row => formatString(row.date), {
      filterFn: dateRangeFilterFn,
      header: "Date",
      id: "date",
    }),

    columnHelper.display({
      header: "Document#",
      cell: info => {
        return formatString(info.row.original.documentNumber);
      },
    }),

    columnHelper.accessor(row => formatString(row.memo, 40), {
      enableSorting: false,
      header: "Memo/Description",
      id: "memo",
    }),

    columnHelper.display({
      header: "Name",
      cell: info => {
        return formatString(info.row.original.name, 40);
      },
    }),

    columnHelper.display({
      header: "Amount",
      cell: info => {
        return info.row.original.amount != null ? info.row.original.amount.toFixed(2) : "n/a";
      },
    }),

    columnHelper.accessor(row => row.id, {
      enableSorting: false,
      filterFn: accountGroupFilterFn,
      header: () => <span>Account Group</span>,
      id: "account_group",
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
    columns,
    data: allTransactions,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnVisibility: {
        account_group: false,
      }
    },
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
          <span className="me-5">Transactions Table</span>
          <Button
            className="bg-info me-2"
            onClick={handleCsvExportOpen}
            size="lg"
          >
            Export CSV
          </Button>
          <Button
            className="bg-info"
            onClick={handleXlsxExportOpen}
            size="lg"
          >
            Export XLSX
          </Button>
        </h1>
      </Row>

      <Row className="mb-2">

        <Col>
          <TextFieldFilter
            controlId="fromDateFilter"
            label="Filter by From Transaction Date:"
            placeholder="YYYY-MM-DD"
            setTextFieldFilter={setFromDateFilter}
            textFieldFilter={fromDateFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="toDateFilter"
            label="Filter by To Transaction Date:"
            placeholder="YYYY-MM-DD"
            setTextFieldFilter={setToDateFilter}
            textFieldFilter={toDateFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="gl_account"
            label="Filter by GL Account:"
            placeholder="Enter part of number or name to filter"
            setTextFieldFilter={setAccountFilter}
            textFieldFilter={accountFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="memoFilter"
            label="Filter by To Memo/Description:"
            placeholder="Enter part of memo/description"
            setTextFieldFilter={setMemoFilter}
            textFieldFilter={memoFilter}
          />
        </Col>

        <Col>
          <AccountGroupFilter
            accountGroupFilter={accountGroupFilter}
            setAccountGroupFilter={setAccountGroupFilter}
          />
        </Col>

      </Row>

      <DataTable
        showPagination={true}
        table={table}
      />

      <TransactionsCsvExport
        hide={handleCsvExportClose}
        show={showCsvExport}
        transactions={table.getSortedRowModel().flatRows.map(row => row.original)}
      />

      <TransactionMoreInfo
        hide={handleMoreInfoClose}
        transaction={currentTransaction}
        show={showMoreInfo}
      />

      <TransactionsXlsxExport
        hideAction={handleXlsxExportClose}
        show={showXlsxExport}
        transactions={table.getSortedRowModel().flatRows.map(row => row.original)}
      />

    </Container>
  );

}

// Private Objects -----------------------------------------------------------

const columnHelper = createColumnHelper<TransactionPlus>();

/**
 * Account group filter function for the Transactions table.  The filter "value"
 * should be the name of an account group, such as "ComDev" or "Marketing", that must
 * be matched by the current row.
 */
const accountGroupFilterFn: FilterFn<TransactionPlus> = (row, columnId, value) => {
  logger.trace({
    function: "accountGroupFilterFn",
    row,
    columnId,
    value,
  });
  if (!value || (value === "All")) {
    return true; // If no value is provided, do not filter out any rows
  } else {
    const account = row.original.account;
    if (account && account.acctNum && (account.acctNum.length >= 4)) {
      return isAccountInGroup(account.acctNum.substring(0, 4), value);
    } else {
      return false;
    }
  }
}

/**
 * Date range filter function for the Transactions table.  The filter "value"
 * should be a string in the format "YYYY-MM-DD|YYYY-MM-DD", where the first date
 * is the "from" date, and the second date is the "to" date.  If either or both
 * filters are empty, then that filter is not applied for the date.
 *
 * Note that the field value is in the format "YYYY-MM-DD", so we need to
 * adjust the comparison value accordingly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dateRangeFilterFn = (row: any, columnId: string, value: string) => {

  logger.trace({
    function: "dateRangeFilterFn",
    row,
    columnId,
    value,
  })

  if (!value || (value === "|")) {
    return true; // No filter applied
  }

  const initialCellValue = row.getValue(columnId);
  if (typeof initialCellValue !== "string") {
    return true; // Invalid date value in the row, so just accept it
  }

  const [fromDate, toDate] = value.split("|");
//  console.log(`initialCellValue: ${initialCellValue}, compareCellValue: ${compareCellValue}, fromDate: ${fromDate}, toDate: ${toDate}`);
  if ((fromDate.length >= 10) && (initialCellValue < fromDate.substring(0, 10))) {
    return false; // Cell value is before the "from" date
  }
  if ((toDate.length >= 10) && (initialCellValue > toDate.substring(0, 10))) {
    return false; // Cell value is after the "to" date
  }
  return true; // Cell value is within the date range

}
