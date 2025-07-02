"use client";

/**
 * Overview table for Bills.
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
import { BillsCsvExport } from "@/components/bills/BillsCsvExport";
import { BillMoreInfo } from "@/components/bills/BillMoreInfo";
import {
  formatAccountNumberAndName,
  formatBillAmount,
  formatBillDueDate,
  formatBillExchangeRate,
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
    { id: "name", desc: false },
  ]);
  const [toDueDateFilter, setToDueDateFilter] = useState<string>("");
  const [toInvoiceDateFilter, setToInvoiceDateFilter] = useState<string>("");
  const [vendorNameFilter, setVendorNameFilter] = useState<string>("");

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

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

  }, [fromDueDateFilter, fromInvoiceDateFilter, toDueDateFilter, toInvoiceDateFilter, vendorNameFilter]);

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
    columnHelper.accessor("vendor.name", {
      cell: info => {
        return <span>{formatVendorName(info.row.original.vendor)}</span>;
      },
      header: "Vendor Name",
      id: "vendor.name",
    }),
    columnHelper.accessor("invoiceDate", {
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
    columnHelper.accessor("dueDate", {
      cell: info => {
        return <span>{formatBillDueDate(info.row.original)}</span>;
      },
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
    columnHelper.display({
      cell: info => {
        return <span>{formatBillExchangeRate(info.row.original) || "n/a"}</span>;
      },
      header: "Exchange Rate",
      id: "exchangeRate",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{formatAccountNumberAndName(info.row.original.classifications?.account)}</span>
      },
      header: "GL Account",
      id: "accountNumber",
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
          <Form.Group controlId="nameFilter">
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
          <Form.Group controlId={fromDueDateFilter}>
            <span>Filter by From Due Date:</span>
            <Form.Control
              onChange={e => setFromDueDateFilter(e.target.value.toLowerCase())}
              placeholder="Enter YYYYMMDD"
              type="text"
              value={fromDueDateFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={toDueDateFilter}>
            <span>Filter by To Due Date:</span>
            <Form.Control
              onChange={e => setToDueDateFilter(e.target.value.toLowerCase())}
              placeholder="Enter YYYYMMDD"
              type="text"
              value={toDueDateFilter}
            />
          </Form.Group>
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
