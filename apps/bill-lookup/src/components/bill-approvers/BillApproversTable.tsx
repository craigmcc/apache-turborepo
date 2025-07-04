"use client";

/**
 * Overview table for Bill Approvers.
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
//import { BillApproversCsvExport } from "@/components/bill-approvers/BillApproversCsvExport";
import { BillApproverMoreInfo } from "@/components/bill-approvers/BillApproverMoreInfo";
import {
  formatAccountNumberAndName,
  formatBillAmount,
  formatBillInvoiceDate,
  formatUserName,
  formatVendorName,
} from "@/lib/Formatters";
import {BillApproverPlus} from "@/types/types";

// Public Objects ------------------------------------------------------------

export type BillApproversTableProps = {
  // Bill Approvers to display
  allBillApprovers: BillApproverPlus[];
};

export function BillApproversTable({ allBillApprovers }: BillApproversTableProps) {

  const [accountFilter, setAccountFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentBillApprover, setCurrentBillApprover] = useState<BillApproverPlus | null>(null);
  const [fromInvoiceDateFilter, setFromInvoiceDateFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "bill.vendor.name", desc: false },
    { id: "bill.invoiceDate", desc: false },
  ]);
  const [toInvoiceDateFilter, setToInvoiceDateFilter] = useState<string>("");
  const [userNameFilter, setUserNameFilter] = useState<string>("");
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

    const invoiceDateFilter = fromInvoiceDateFilter + "|" + toInvoiceDateFilter;
    if (invoiceDateFilter.length > 1) {
      filters.push({
        id: "bill.invoiceDate",
        value: invoiceDateFilter,
      });
    }

    if (userNameFilter.length > 0) {
      filters.push({
        id: "user.name",
        value: userNameFilter,
      });
    }

    if (vendorNameFilter.length > 0) {
      filters.push({
        id: "bill.vendor.name",
        value: vendorNameFilter,
      });
    }

    setColumnFilters(filters);

  }, [accountFilter, fromInvoiceDateFilter,toInvoiceDateFilter, userNameFilter, vendorNameFilter]);

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
    setCurrentBillApprover(null);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(billApprover: BillApproverPlus) {
    setCurrentBillApprover(billApprover);
    setShowMoreInfo(true);
  }

  // Column definitions for the Bill Approvers table
  const columns = useMemo(() => [

    columnHelper.accessor(
      row => formatVendorName(row.bill?.vendor),
      {
        header: "Vendor Name",
        id: "bill.vendor.name",
      }
    ),

    columnHelper.accessor(
      row => formatBillInvoiceDate(row.bill),
      {
        filterFn: dateRangeFilterFn,
        header: "Invoice Date",
        id: "bill.invoiceDate",
      }),

    columnHelper.display({
      cell: info => {
        return <span>{formatBillAmount(info.row.original.bill)}</span>;
      },
      header: "Amount (USD)",
      id: "bill.amount",
    }),

    columnHelper.accessor(
      row => formatAccountNumberAndName(row.bill?.classifications?.account),
      {
        enableSorting: false,
        header: "GL Account",
        id: "gl_account",
      }),

    columnHelper.display({
      cell: info => {
        const archived = info.row.original.bill?.archived;
        if (archived) {
          return <span className="text-warning">Yes</span>;
        } else {
          return <span className="text-success">No</span>;
        }
      },
      header: "Archived",
      id: "archived",
    }),

    columnHelper.accessor(
      row => formatUserName(row.user),
      {
        header: "Approver Name",
        id: "user.name",
      }),

    columnHelper.display({
      cell: info => {
        const archived = info.row.original.bill?.archived;
        const status = info.row.original.status;
        if (archived) {
          return <span className="text-secondary">Archived</span>;
        } else if (status === "Approved") {
          return <span className="text-success">Approved</span>;
        } else if (status === "Denied") {
          return <span className="text-danger">Denied</span>;
        } else if (status === "Stale") {
          return <span className="text-warning">Stale</span>;
        } else if (status === "Upcoming") {
          return <span className="text-info">Upcoming</span>;
        } else {
          return <span className="text-secondary">{status}</span>;
        }
      },
      header: "Approval Status",
      id: "status",
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
  const table = useReactTable<BillApproverPlus>({
    columns,
    data: allBillApprovers,
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
          <span className="me-5">Bill Approvers Table</span>
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
          <Form.Group controlId="vendorNameFilter">
            <span>Filter by Vendor Name:</span>
            <Form.Control
              onChange={e => setVendorNameFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of a name to filter"
              type="text"
              value={vendorNameFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={fromInvoiceDateFilter}>
            <span>Filter by From Invoice Date:</span>
            <Form.Control
              onChange={e => setFromInvoiceDateFilter(e.target.value.toLowerCase())}
              placeholder="Enter YYYYMMDD"
              type="text"
              value={fromInvoiceDateFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={toInvoiceDateFilter}>
            <span>Filter by To Invoice Date:</span>
            <Form.Control
              onChange={e => setToInvoiceDateFilter(e.target.value.toLowerCase())}
              placeholder="Enter YYYYMMDD"
              type="text"
              value={toInvoiceDateFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="accountFilter">
            <span>Filter by GL Account:</span>
            <Form.Control
              onChange={e => setAccountFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of number or name to filter"
              type="text"
              value={accountFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="userNameFilter">
            <span>Filter by Approver Name:</span>
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

      {/*
      <BillApproversCsvExport
        billApprovers={table.getSortedRowModel().flatRows.map(row => row.original)}
        hide={handleCsvExportClose}
        show={showCsvExport}
      />
*/}

      <BillApproverMoreInfo
        billApprover={currentBillApprover}
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
const columnHelper = createColumnHelper<BillApproverPlus>();

/**
 * Daet range filter function for the Bills table.  The filter "value"
 * should be a string in the format "YYYYMMDD|YYYYMMDD", where the first date
 * is the "from" date, and the second date is the "to" date.  If either or both
 * filters are empty, then that filter is not applied for the date.
 *
 * Note that the field value is in the format "YYYY-MM-DD", so we need to
 * adjust the comparison value accordingly.
 */
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

  const [fromDate, toDate] = value.split("|");
  if ((fromDate.length >= 8) && (compareCellValue < fromDate.substring(0, 8))) {
    return false; // Cell value is before the "from" date
  }
  if ((toDate.length >= 8) && (compareCellValue > toDate.substring(0, 8))) {
    return false; // Cell value is after the "to" date
  }
  return true; // Cell value is within the date range

}
