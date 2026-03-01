"use client";

/**
 * Overview table for Bills.
 */

// External Imports ----------------------------------------------------------

import { DataTable } from "@repo/shared-components/DataTable";
import { AccountGroupFilter } from "@repo/shared-components/AccountGroupFilter";
import { TextFieldFilter } from "@repo/shared-components/TextFieldFilter";
import { isAccountInGroup } from "@repo/shared-utils";
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
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { BillsCsvExport } from "@/components/bills/BillsCsvExport";
import { BillMoreInfo } from "@/components/bills/BillMoreInfo";
import {
  formatAccountNumberAndName,
  formatBillAmount,
  formatBillDueDate,
//  formatBillExchangeRate,
  formatBillInvoiceDate,
  formatBillInvoiceNumber,
  formatBillPaidAmount,
  formatVendorName
} from "@/lib/Formatters";
import { BillPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type BillsTableProps = {
  // All Bills to display in the table
  allBills: BillPlus[];
}

export function BillsTable({ allBills }: BillsTableProps) {

  const [accountFilter, setAccountFilter] = useState<string>("");
  const [accountGroupFilter, setAccountGroupFilter] = useState<string>("All");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentBill, setCurrentBill] = useState<BillPlus | null>(null);
  const [fromDueDateFilter, setFromDueDateFilter] = useState<string>("");
  const [fromInvoiceDateFilter, setFromInvoiceDateFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "vendor.name", desc: false },
    { id: "invoiceDate", desc: true },
  ]);
  const [toDueDateFilter, setToDueDateFilter] = useState<string>("");
  const [toInvoiceDateFilter, setToInvoiceDateFilter] = useState<string>("");
  const [vendorNameFilter, setVendorNameFilter] = useState<string>("");

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    if (accountFilter.length > 0) {
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

    const dueDateFilter = fromDueDateFilter + "|" + toDueDateFilter;
    if (dueDateFilter.length > 1) {
      filters.push({
        id: "dueDate",
        value: dueDateFilter,
      });
    }

    const invoiceDateFilter = fromInvoiceDateFilter + "|" + toInvoiceDateFilter;
    if (invoiceDateFilter.length > 1) {
      filters.push({
        id: "invoiceDate",
        value: invoiceDateFilter,
      });
    }

    if (vendorNameFilter.length > 0) {
      filters.push({
        id: "vendor.name",
        value: vendorNameFilter,
      });
    }

    setColumnFilters(filters);

  }, [accountFilter, accountGroupFilter, fromDueDateFilter, fromInvoiceDateFilter, toDueDateFilter, toInvoiceDateFilter, vendorNameFilter]);

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
    setCurrentBill(null);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(bill: BillPlus) {
    setCurrentBill(bill);
    setShowMoreInfo(true);
  }

  // Column definitions for the Bills table
  const columns = useMemo(() => [

    columnHelper.accessor(row => formatVendorName(row.vendor), {
      header: "Vendor Name",
      id: "vendor.name",
    }),

    columnHelper.accessor(
      row => row.invoiceDate,
      {
        cell: info => {
          return <span>{formatBillInvoiceDate(info.row.original)}</span>
        },
        filterFn: dateRangeFilterFn,
        header: "Invoice Date",
        id: "invoiceDate",
      }),

    columnHelper.display({
      cell: info => {
        return <span>{formatBillInvoiceNumber(info.row.original)}</span>;
      },
      header: "Invoice Number",
      id: "invoiceNumber",
    }),

    columnHelper.accessor(
      row => row.dueDate,
      {
        cell: info => {
          return <span>{formatBillDueDate(info.row.original)}</span>
        },
        enableSorting: false,
        filterFn: dateRangeFilterFn,
        header: "Due Date",
        id: "dueDate",
      }),

    columnHelper.display({
      cell: info => {
        return <span>{formatBillAmount(info.row.original)}</span>;
      },
      header: "Total (USD)",
      id: "amount",
    }),

    columnHelper.display({
      cell: info => {
        return <span>{formatBillPaidAmount(info.row.original)}</span>
      },
      header: "Paid (Local)",
      id: "paidAmount",
    }),

/*
    columnHelper.display({
      cell: info => {
        return <span>{formatBillExchangeRate(info.row.original) || "n/a"}</span>;
      },
      header: "Exchange Rate",
      id: "exchangeRate",
    }),
*/

    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.approvalStatus || "n/a"}</span>;
      },
      header: "Approved?",
      id: "approvalStatus",
    }),

    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.paymentStatus || "n/a"}</span>;
      },
      header: "Paid?",
      id: "paymentStatus",
    }),

    columnHelper.accessor(
      row => formatAccountNumberAndName(row.classifications?.account),
      {
        enableSorting: false,
        header: "GL Account",
        id: "gl_account",
      }),

    columnHelper.display({
      cell: info => {
        const archived = info.row.original.archived;
        if (archived) {
          return <span className="text-warning">Yes</span>;
        } else {
          return <span className="text-success">No</span>;
        }
      },
      header: "Archived",
      id: "archived",
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
  const table = useReactTable<BillPlus>({
    columns,
    data: allBills,
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
          <span className="me-5">Bills Table</span>
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
            controlId="nameFilter"
            label="Filter by Vendor Name:"
            placeholder="Enter part of name"
            setTextFieldFilter={setVendorNameFilter}
            textFieldFilter={vendorNameFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="fromInvoiceDateFilter"
            label="Filter by From Invoice Date:"
            placeholder="Enter YYYYMMDD"
            setTextFieldFilter={setFromInvoiceDateFilter}
            textFieldFilter={fromInvoiceDateFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="toInvoiceDateFilter"
            label="Filter by To Invoice Date:"
            placeholder="Enter YYYYMMDD"
            setTextFieldFilter={setToInvoiceDateFilter}
            textFieldFilter={toInvoiceDateFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="fromDueDateFilter"
            label="Filter by From Due Date:"
            placeholder="Enter YYYYMMDD"
            setTextFieldFilter={setFromDueDateFilter}
            textFieldFilter={fromDueDateFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="toDueDateFilter"
            label="Filter by To Due Date:"
            placeholder="Enter YYYYMMDD"
            setTextFieldFilter={setToDueDateFilter}
            textFieldFilter={toDueDateFilter}
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

      <BillsCsvExport
        bills={table.getSortedRowModel().flatRows.map(row => row.original)}
        hide={handleCsvExportClose}
        show={showCsvExport}
      />

      <BillMoreInfo
        bill={currentBill}
        hide={handleMoreInfoClose}
        show={showMoreInfo}
      />

    </Container>
  );
}

// Private Objects -----------------------------------------------------------

/**
 * Helper for creating columns in the Users table.
 */
const columnHelper = createColumnHelper<BillPlus>();

/**
 * Account group filter function for the Bills table.  The filter "value"
 * should be the name of an account group, such as "ComDev" or "Marketing", that must
 * be matched by the current row.
 */
const accountGroupFilterFn: FilterFn<BillPlus> = (row, columnId, value) => {
  if (!value || (value === "All")) {
    return true; // If no value is provided, do not filter out any rows
  } else {
    const account = row.original.classifications?.account;
    if (account && account.accountNumber && (account.accountNumber.length >= 4)) {
      return isAccountInGroup(account.accountNumber.substring(0, 4), value);
    } else {
      return false;
    }
  }
}

/**
 * Date range filter function for the Bills table.  The filter "value"
 * should be a string in the format "YYYYMMDD|YYYYMMDD", where the first date
 * is the "from" date, and the second date is the "to" date.  If either or both
 * filters are empty, then that filter is not applied for the date.
 *
 * Note that the field value is in the format "YYYY-MM-DD", so we need to
 * adjust the comparison value accordingly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dateRangeFilterFn = (row: any, columnId: string, value: string) => {

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

  const [fromDate = '', toDate = ''] = value.split("|");
//  console.log(`initialCellValue: ${initialCellValue}, compareCellValue: ${compareCellValue}, fromDate: ${fromDate}, toDate: ${toDate}`);
  if ((fromDate.length >= 8) && (compareCellValue < fromDate.substring(0, 8))) {
    return false; // Cell value is before the "from" date
  }
  if ((toDate.length >= 8) && (compareCellValue > toDate.substring(0, 8))) {
    return false; // Cell value is after the "to" date
  }
  return true; // Cell value is within the date range

}
