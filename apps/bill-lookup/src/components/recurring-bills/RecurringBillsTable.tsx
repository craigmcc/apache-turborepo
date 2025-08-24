"use client";

/**
 * Overview table for Recurring Bills.
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
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { RecurringBillsCsvExport } from "@/components/recurring-bills/RecurringBillsCsvExport";
import { RecurringBillMoreInfo } from "@/components/recurring-bills/RecurringBillMoreInfo";
import {
  formatAccountNumberAndName,
  formatRecurringBillAmount,
  formatVendorName
} from "@/lib/Formatters";
import { RecurringBillPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type RecurringBillsTableProps = {
  // All Bills to display in the table
  allBills: RecurringBillPlus[];
}

export function RecurringBillsTable({ allBills }: RecurringBillsTableProps) {

  const [accountFilter, setAccountFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentRecurringBill, setCurrentRecurringBill] = useState<RecurringBillPlus | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "vendor.name", desc: false },
  ]);
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

    if (vendorNameFilter.length > 0) {
      filters.push({
        id: "vendor.name",
        value: vendorNameFilter,
      });
    }

    setColumnFilters(filters);

  }, [accountFilter, vendorNameFilter]);

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
    setCurrentRecurringBill(null);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(bill: RecurringBillPlus) {
    setCurrentRecurringBill(bill);
    setShowMoreInfo(true);
  }

  // Column definitions for the Recurring Bills table
  const columns = useMemo(() => [

    columnHelper.accessor(row => formatVendorName(row.vendor), {
      header: "Vendor Name",
      id: "vendor.name",
    }),

/*
    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.description || "n/a"}</span>;
      },
      header: "Description",
      id: "description",
    }),
*/

    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.schedule?.endDate || "n/a"}</span>;
      },
      header: "End Date",
      id: "schedule.endDate",
    }),

    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.schedule?.daysInAdvance || "n/a"}</span>;
      },
      header: "Ahead Days",
      id: "schedule.daysInAdvance",
    }),

/*
    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.schedule?.frequency || "n/a"}</span>;
      },
      header: "Freq.",
      id: "schedule.frequency",
    }),
*/

    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.schedule?.period || null}</span>;
      },
      header: "Period",
      id: "schedule.period",
    }),

    columnHelper.display({
      cell: info => {
        return <span>{formatRecurringBillAmount(info.row.original)}</span>;
      },
      header: "Amount",
      id: "amount",
    }),

    columnHelper.accessor(
      row => formatAccountNumberAndName(row.lineItems?.[0]?.classifications?.account),
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
  const table = useReactTable<RecurringBillPlus>({
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
          <span className="me-5">Recurring Bills Table</span>
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
            controlId="accountFilter"
            label="Filter by GL Account:"
            placeholder="Enter part of number or name to filter"
            setTextFieldFilter={setAccountFilter}
            textFieldFilter={accountFilter}
          />
        </Col>

      </Row>

      <DataTable
        showPagination={true}
        table={table}
      />

      <RecurringBillsCsvExport
        bills={table.getSortedRowModel().flatRows.map(row => row.original)}
        hide={handleCsvExportClose}
        show={showCsvExport}
      />

      <RecurringBillMoreInfo
        bill={currentRecurringBill}
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
const columnHelper = createColumnHelper<RecurringBillPlus>();
