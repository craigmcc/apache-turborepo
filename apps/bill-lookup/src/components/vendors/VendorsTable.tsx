"use client";

/**
 * Overview table for Vendors.
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

import { VendorsCsvExport } from "@/components/vendors/VendorsCsvExport";
import { VendorMoreInfo } from "@/components/vendors/VendorMoreInfo";
import {
  formatVendorEmail,
  formatVendorName,
} from "@/lib/Formatters";
import { VendorPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type VendorsTableProps = {
  // All Vendors to display in the table
  allVendors: VendorPlus[];
}

export function VendorsTable({ allVendors }: VendorsTableProps) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentVendor, setCurrentVendor] = useState<VendorPlus | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [vendorNameFilter, setVendorNameFilter] = useState<string>("");

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    if (vendorNameFilter.length > 0) {
      filters.push({
        id: "name",
        value: vendorNameFilter,
      });
    }

    setColumnFilters(filters);

  }, [vendorNameFilter]);

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
    setCurrentVendor(null);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(vendor: VendorPlus) {
    setCurrentVendor(vendor);
    setShowMoreInfo(true);
  }

  // Column definitions for the Users table
  const columns = useMemo(() => [

    columnHelper.accessor(row => formatVendorName(row), {
      header: "Vendor Name",
      id: "name",
    }),

    columnHelper.display({
      cell: info => {
        return <span>{formatVendorEmail(info.row.original)}</span>
      },
      header: "Vendor Email",
      id: "email",
    }),

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
  const table = useReactTable<VendorPlus>({
    columns,
    data: allVendors,
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
          <span className="me-5">Vendors Table</span>
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

      </Row>

      <DataTable
        showPagination={true}
        table={table}
      />

      <VendorsCsvExport
        hide={handleCsvExportClose}
        show={showCsvExport}
        vendors={table.getSortedRowModel().flatRows.map(row => row.original)}
      />

      <VendorMoreInfo
        hide={handleMoreInfoClose}
        show={showMoreInfo}
        vendor={currentVendor}
      />

    </Container>
  );
}

// Private Objects -----------------------------------------------------------

/**
 * Helper for creating columns in the Users table.
 */
const columnHelper = createColumnHelper<VendorPlus>();
