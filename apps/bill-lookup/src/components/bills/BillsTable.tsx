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
import { formatVendorName } from "@/lib/Formatters";
import { BillPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type BillsTableProps = {
  // All Bills to display in the table
  allBills: BillPlus[];
}

export function BillsTable({ allBills }: BillsTableProps) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentBill, setCurrentBill] = useState<BillPlus | null>(null);
  const [fromDateFilter, setFromDateFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [toDateFilter, setToDateFilter] = useState<string>("");
  const [vendorNameFilter, setVendorNameFilter] = useState<string>("");

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    const dueDateFilter = fromDateFilter + "|" + toDateFilter;
    if (dueDateFilter.length > 1) {
      filters.push({
        id: "dueDate",
        value: dueDateFilter,
      });
    }

    if (vendorNameFilter.length > 0) {
      filters.push({
        id: "name",
        value: vendorNameFilter,
      });
    }

    setColumnFilters(filters);

  }, [fromDateFilter, toDateFilter, vendorNameFilter]);

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

  // Column definitions for the Users table
  const columns = useMemo(() => [
    columnHelper.accessor("dueDate", {
      cell: info => {
        const dueDate = info.getValue();
        if (dueDate) {
          return <span>{new Date(dueDate).toLocaleDateString()}</span>;
        } else {
          return <span>n/a</span>
        }
      },
      filterFn: dateRangeFilterFn,
      header: "Due Date",
      id: "dueDate",
    }),
    columnHelper.accessor(row => formatVendorName(row.vendor), {
      cell: info => {
        return <span>{formatVendorName(info.row.original.vendor)}</span>;
      },
      header: "Vendor Name",
      id: "name",
    }),
/*
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
      },
      header: "Archived",
      id: "archived",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.accountType || "n/a"}</span>
      },
      header: "Account Type",
      id: "accountType",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.paymentInformation?.payByType || "n/a"}</span>
      },
      header: "Pay By Type",
      id: "payByType",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.paymentInformation?.payBySubType || "n/a"}</span>
      },
      header: "Pay By SubType",
      id: "payBySubtype",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.balance_amount || "n/a"}</span>
      },
      header: "Balance Amount",
      id: "balance_amount",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.balance_lastUpdatedDate || "n/a"}</span>
      },
      header: "Balance Last Updated",
      id: "balance_lastUpdatedDate",
    }),
*/
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
          <Form.Group controlId={fromDateFilter}>
            <span>Filter by From Due Date:</span>
            <Form.Control
              onChange={e => setFromDateFilter(e.target.value.toLowerCase())}
              placeholder="Enter YYYYMMDD"
              type="text"
              value={fromDateFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={toDateFilter}>
            <span>Filter by To Due Date:</span>
            <Form.Control
              onChange={e => setToDateFilter(e.target.value.toLowerCase())}
              placeholder="Enter YYYYMMDD"
              type="text"
              value={toDateFilter}
            />
          </Form.Group>
        </Col>
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
