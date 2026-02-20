"use client";

/**
 * Overview table for JournalEntryLines.
 */

// External Imports ----------------------------------------------------------

import { AccountGroupFilter, DataTable } from "@repo/shared-components/DataTable";
import { TextFieldFilter } from "@repo/shared-components/TextFieldFilter";
import { isAccountInGroup } from "@repo/shared-utils/AccountGroups";
import { clientLogger as logger } from "@repo/shared-utils/ClientLogger";
import {
  ColumnFiltersState,
  createColumnHelper,
  FilterFn,
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

import { JournalEntryLinePlus } from "@/types/types";
import { JournalLinesCsvExport } from "@/components/journalLines/JournalLinesCsvExport";
import { JournalLineMoreInfo } from "@/components/journalLines/JournalLineMoreInfo";
import {
  formatAccountNumberAndName,
  formatJournalEntryLineAmount,
  formatString,
} from "@/lib/Formatters";

// Public Objects ------------------------------------------------------------

export type JournalLinesTableProps = {
  // All JournalEntryLines to display in the table
  allJournalLines: JournalEntryLinePlus[];
};

export function JournalLinesTable({ allJournalLines }: JournalLinesTableProps) {

  const [accountFilter, setAccountFilter] = useState<string>("");
  const [accountGroupFilter, setAccountGroupFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentJournalLine, setCurrentJournalLine] = useState<JournalEntryLinePlus | null>(null);
  const [descriptionFilter, setDescriptionFilter] = useState<string>("");
  const [fromTxnDateFilter, setFromTxnDateFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    {id: "gl_account", desc: false},
    {id: "journalEntry.txnDate", desc: false},
  ]);
  const [toTxnDateFilter, setToTxnDateFilter] = useState<string>("");

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

    if (descriptionFilter) {
      filters.push({
        id: "description",
        value: descriptionFilter,
      });
    }

    const txnDateFilter = `${fromTxnDateFilter}|${toTxnDateFilter}`;
    if (txnDateFilter !== "|") {
      filters.push({
        id: "journalEntry.txnDate",
        value: txnDateFilter,
      });
    }

    setColumnFilters(filters);

  }, [accountFilter, accountGroupFilter, descriptionFilter, fromTxnDateFilter, toTxnDateFilter]);

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
    setCurrentJournalLine(null);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(line: JournalEntryLinePlus) {
    setCurrentJournalLine(line);
    setShowMoreInfo(true);
  }

  // Column definitions for the JournalEntryLines table
  const columns = useMemo(() => [

    columnHelper.accessor(
      row => row.journalEntry?.txnDate,
      {
        filterFn: dateRangeFilterFn,
        header: "Transaction Date",
        id: "journalEntry.txnDate",
      }),

    columnHelper.display({
      cell: info => {
        return <span>{formatJournalEntryLineAmount(info.row.original)}</span>
      },
      header: "Amount",
      id: "amount",
    }),

    columnHelper.accessor(
      row => formatString(row.description, 100),
      {
        enableSorting: false,
        header: "Description",
        id: "description",
      }
    ),

    columnHelper.accessor(
      row => formatAccountNumberAndName(row.account),
      {
        enableSorting: true,
        header: "GL Account",
        id: "gl_account",
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

  // Overall table instance
  const table = useReactTable<JournalEntryLinePlus>({
    columns,
    data: allJournalLines,
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
          <span className="me-5">Journal Lines Table</span>
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
              controlId="fromTxnDateFilter"
              label="Filter by From Transaction Date:"
              placeholder="Enter YYYYMMDD"
              setTextFieldFilter={setFromTxnDateFilter}
              textFieldFilter={fromTxnDateFilter}
            />
          </Col>

        <Col>
          <TextFieldFilter
            controlId="toTxnDateFilter"
            label="Filter by To Transaction Date:"
            placeholder="Enter YYYYMMDD"
            setTextFieldFilter={setToTxnDateFilter}
            textFieldFilter={toTxnDateFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="descriptionFilter"
            label="Filter by Description:"
            placeholder="Enter part of description to filter"
            setTextFieldFilter={setDescriptionFilter}
            textFieldFilter={descriptionFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="accountFilter"
            label="Filter by GL Account:"
            placeholder="Enter part of number or name to filter"
            setTextFieldFilter={setAccountFilter}
            textFieldFilter={accountFilter}
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

      <JournalLinesCsvExport
        hide={handleCsvExportClose}
        lines={table.getSortedRowModel().flatRows.map(row => row.original)}
        show={showCsvExport}
      />

      <JournalLineMoreInfo
        hide={handleMoreInfoClose}
        journalLine={currentJournalLine}
        show={showMoreInfo}
      />

    </Container>
  );

}

// Private Objects -----------------------------------------------------------

const columnHelper = createColumnHelper<JournalEntryLinePlus>();

/**
 * Account group filter function for the JournalEntryLines table.  The filter "value"
 * should be the name of an account group, such as "ComDev" or "Marketing", that must
 * be matched by the current row.
 */
const accountGroupFilterFn: FilterFn<JournalEntryLinePlus> = (row, columnId, value) => {
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
 * Date range filter function for the Journal Entry Lines table.  The filter "value"
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
  const compareCellValue =
    initialCellValue.substring(0, 4) + // Year part
    initialCellValue.substring(5, 7) + // Month part
    initialCellValue.substring(8, 10); // Day part

  const [fromDate, toDate] = value.split("|");
//  console.log(`initialCellValue: ${initialCellValue}, compareCellValue: ${compareCellValue}, fromDate: ${fromDate}, toDate: ${toDate}`);
  if ((fromDate.length >= 8) && (compareCellValue < fromDate.substring(0, 8))) {
    return false; // Cell value is before the "from" date
  }
  if ((toDate.length >= 8) && (compareCellValue > toDate.substring(0, 8))) {
    return false; // Cell value is after the "to" date
  }
  return true; // Cell value is within the date range

}
